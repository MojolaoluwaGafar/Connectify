import { type Server, type Socket } from 'socket.io';
import {
  assertParticipant,
  markRead,
  sendMessageService,
} from '../modules/conversations/conversations.service.js';
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
      await assertParticipant(conversationId, userId);

      socket.to(conversationId).emit('user_typing', {
        conversationId,
        userId,
      });
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
      await assertParticipant(conversationId, userId);

      socket.to(conversationId).emit('user_stop_typing', {
        conversationId,
        userId,
      });
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

      io.to(conversationId).emit('receive_message', {
        conversationId,
        ...message,
      });
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
