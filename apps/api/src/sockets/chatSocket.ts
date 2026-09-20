import { type Server, type Socket } from 'socket.io';
import {
  assertParticipant,
  markRead,
  parseConversationId,
  sendMessageService,
} from '../modules/conversations/conversations.service.js';
import { Profile } from '../model/profile.js';
type ConversationEvent = {
  conversationId: string;
};

const normalizeConversationId = (conversationId: string | number) =>
  String(conversationId);

export function registerChatHandlers(socket: Socket, io: Server) {
socket.on(
  'join_conversation',
  async (conversationId: string | number) => {
    const roomId = normalizeConversationId(conversationId);
    const userId = socket.data.userId as string | undefined;

    if (!roomId || !userId) {
      return;
    }

    try {
      await assertParticipant(roomId, userId);

      socket.join(roomId);


      socket.emit('conversation_joined', {
        conversationId: roomId,
      });
    } catch (error) {
      socket.emit('join_conversation_error', {
        conversationId: roomId,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to join conversation',
      });
    }
  },
);

  socket.on('leave_conversation', (conversationId: string | number) => {
    const roomId = normalizeConversationId(conversationId);
    if (!roomId) return;

    socket.leave(roomId);
  });

 socket.on(
  'typing_start',
  async ({ conversationId }: ConversationEvent) => {
    const userId = socket.data.userId as string | undefined;

    if (!conversationId || !userId) return;

    try {
      const recipientId = await assertParticipant(conversationId, userId);

      const payload = { conversationId, userId };

      // The room only has whoever currently has this exact chat open.
      // Also push to the recipient's personal room so a "typing…" status
      // can show up in their conversation list even when they don't.
      socket.to(conversationId).emit('user_typing', payload);
      io.to(recipientId).emit('user_typing', payload);
    } catch {
      return;
    }
  },
);
socket.on(
  'typing_stop',
  async ({ conversationId }: ConversationEvent) => {
    const userId = socket.data.userId as string | undefined;

    if (!conversationId || !userId) return;

    try {
      const recipientId = await assertParticipant(conversationId, userId);

      const payload = { conversationId, userId };

      socket.to(conversationId).emit('user_stop_typing', payload);
      io.to(recipientId).emit('user_stop_typing', payload);
    } catch {
      return;
    }
  },
);
socket.on(
  'send_message',
  async ({
    conversationId,
    content,
  }: {
    conversationId: string;
    content: string;
  }) => {

    // console.log("SEND_MESSAGE EVENT RECEIVED");
    const userId = socket.data.userId as string | undefined;

    if (!userId || !conversationId) {
      return;
    }

    try {
      const message = await sendMessageService(
        conversationId,
        userId,
        { content },
      );

      // console.log("EMITTING RECEIVE MESSAGE:", {
      //   conversationId,
      //   message,
      // });
      // console.log(
      //   "ROOM MEMBERS:",
      //   conversationId,
      //   io.sockets.adapter.rooms.get(conversationId),
      // );

      io.to(conversationId).emit('receive_message', {
        conversationId,
        ...message,
      });

      // Anyone with this ChatWindow open already got the message above via
      // the conversation room. This second, lighter event goes to the
      // recipient's personal room so the rest of the app (wherever they
      // are) can surface a notification even when that room isn't joined.
      const parsed = parseConversationId(conversationId);
      const recipientId = parsed?.find((id) => id !== userId);

      if (recipientId) {
        const senderProfile = await Profile.findOne({ userId }).lean();

        io.to(recipientId).emit('new_message_notification', {
          conversationId,
          senderId: userId,
          senderName: senderProfile?.fullName ?? 'Someone',
          text: message.text,
        });
      }
    } catch (error) {
      socket.emit('send_message_error', {
        conversationId,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to send message',
      });
    }
  },
);
}
