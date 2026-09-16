import { type Server, type Socket } from 'socket.io';
import {
  assertParticipant,
  markRead,
  sendMessageService,
} from '../modules/conversations/conversations.service.js';
type ConversationEvent = {
  conversationId: string;
};

type MessagePayload = {
  conversationId: string;
  content: string;
  createdAt?: string;
  id?: string;
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

  socket.on('typing_start', ({ conversationId }: ConversationEvent) => {
    const userId = socket.data.userId as string | undefined;
    if (!conversationId || !userId) return;

   socket.to(conversationId).emit('user_typing', {
  conversationId,
  userId,
});
  });

socket.on('typing_stop', ({ conversationId }: ConversationEvent) => {
  const userId = socket.data.userId as string | undefined;

  if (!conversationId || !userId) return;

  socket.to(conversationId).emit('user_stop_typing', {
    conversationId,
    userId,
  });
});
}
