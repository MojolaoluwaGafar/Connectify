import { type Server, type Socket } from 'socket.io';
import {
  assertParticipant,
  markMessageDelivered,
  markRead,
  parseConversationId,
  sendMessageService,
} from '../modules/conversations/conversations.service.js';
import { createNotification } from '../modules/notifications/notifications.service.js';
import { Profile } from '../model/profile.js';
type ConversationEvent = {
  conversationId: string;
};

const normalizeConversationId = (conversationId: string | number) =>
  String(conversationId);

function truncate(text: string, max = 60) {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

// True if any of userId's own sockets are currently in this room — used to
// tell whether they already have this exact chat open right now, so a
// message notification for it would just be noise.
function isUserInRoom(io: Server, roomId: string, userId: string): boolean {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return false;

  for (const socketId of room) {
    if (io.sockets.sockets.get(socketId)?.data.userId === userId) {
      return true;
    }
  }

  return false;
}

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

      const parsed = parseConversationId(conversationId);
      const recipientId = parsed?.find((id) => id !== userId);

      // Every socket joins a room named after its own userId on connect
      // (see chatServer.ts), so a non-empty room means they're online right
      // now — good enough to call the message "delivered" rather than just
      // "sent".
      let outgoing = message;
      if (recipientId && (io.sockets.adapter.rooms.get(recipientId)?.size ?? 0) > 0) {
        const delivered = await markMessageDelivered(message.id);
        if (delivered) outgoing = delivered;
      }

      io.to(conversationId).emit('receive_message', {
        conversationId,
        ...outgoing,
      });

      // Anyone with this ChatWindow open already got the message above via
      // the conversation room. This second, lighter event goes to the
      // recipient's personal room so the rest of the app (wherever they
      // are) can surface a notification even when that room isn't joined.
      if (recipientId) {
        const senderProfile = await Profile.findOne({ userId }).lean();
        const senderName = senderProfile?.fullName ?? 'Someone';

        io.to(recipientId).emit('new_message_notification', {
          conversationId,
          senderId: userId,
          senderName,
          text: message.text,
        });

        // Already has this exact chat open — they're seeing the message
        // live, so a bell notification for it would just be noise.
        //
        // The message itself was already delivered above (io.to(...).emit),
        // so a failure here must never surface as a "message failed to
        // send" error to the sender — it's just the bell notification that
        // didn't get persisted.
        if (!isUserInRoom(io, conversationId, recipientId)) {
          try {
            await createNotification({
              recipientId,
              type: 'message',
              text: `${senderName}: ${truncate(message.text)}`,
              navigateTo: '/messages',
              conversationId,
              relatedUserId: userId,
            });
          } catch (error) {
            console.error('Failed to persist message notification:', error);
          }
        }
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
