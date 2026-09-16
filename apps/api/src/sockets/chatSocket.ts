import { type Server, type Socket } from 'socket.io';
import {
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
  socket.on('join_conversation', (conversationId: string | number) => {
    const roomId = normalizeConversationId(conversationId);
    if (!roomId) return;

    socket.join(roomId);
  });

  socket.on('leave_conversation', (conversationId: string | number) => {
    const roomId = normalizeConversationId(conversationId);
    if (!roomId) return;

    socket.leave(roomId);
  });

  socket.on('typing_start', ({ conversationId }: ConversationEvent) => {
    const userId = socket.data.userId as string | undefined;
    if (!conversationId || !userId) return;

    socket.to(conversationId).emit('user_typing', { conversationId, userId });
    socket.to(conversationId).emit('typing_start', { conversationId, userId });
  });

  socket.on('typing_stop', ({ conversationId }: ConversationEvent) => {
    const userId = socket.data.userId as string | undefined;
    if (!conversationId || !userId) return;

    socket
      .to(conversationId)
      .emit('user_stop_typing', { conversationId, userId });
    socket.to(conversationId).emit('typing_stop', { conversationId, userId });
  });

  socket.on('send_message', async (data: MessagePayload) => {
    const senderId = socket.data.userId as string | undefined;
    if (!data.conversationId || !senderId || !data.content) return;

    try {
      const message = await sendMessageService(data.conversationId, senderId, {
        text: data.content,
      });

      io.to(data.conversationId).emit('receive_message', message);
    } catch (error) {
      socket.emit('send_message_error', {
        conversationId: data.conversationId,
        message:
          error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  });

  socket.on('mark_read', async ({ conversationId }: ConversationEvent) => {
    const userId = socket.data.userId as string | undefined;
    if (!conversationId || !userId) return;

    try {
      await markRead(conversationId, userId);
      io.to(conversationId).emit('conversation_read', {
        conversationId,
        userId,
      });
    } catch {
      // Read receipts aren't critical — fail silently rather than error the socket.
    }
  });

  socket.on('disconnect', () => {
    // Socket cleanup happens in the main connection handler.
  });
}
