import { type Server, type Socket } from 'socket.io'

type ConversationEvent = {
  conversationId: string
}

type MessagePayload = {
  conversationId: string
  content: string
  createdAt?: string
  id?: string
}

const normalizeConversationId = (conversationId: string | number) =>
  String(conversationId)

export function registerChatHandlers(socket: Socket, io: Server) {
  socket.on('join_conversation', (conversationId: string | number) => {
   const roomId = normalizeConversationId(conversationId)
   if (!roomId) return

   socket.join(roomId)
  })

  socket.on('leave_conversation', (conversationId: string | number) => {
   const roomId = normalizeConversationId(conversationId)
   if (!roomId) return

   socket.leave(roomId)
  })

  socket.on(
   'typing_start',
   ({ conversationId }: ConversationEvent) => {
     const userId = socket.data.userId as string | undefined
     if (!conversationId || !userId) return

     socket.to(conversationId).emit('user_typing', { conversationId, userId })
     socket.to(conversationId).emit('typing_start', { conversationId, userId })
   },
  )

  socket.on(
   'typing_stop',
   ({ conversationId }: ConversationEvent) => {
     const userId = socket.data.userId as string | undefined
     if (!conversationId || !userId) return

     socket.to(conversationId).emit('user_stop_typing', { conversationId, userId })
     socket.to(conversationId).emit('typing_stop', { conversationId, userId })
   },
  )

  socket.on('send_message', async (data: MessagePayload) => {
    const { conversationId, content } = data
    const senderId = socket.data.userId as string | undefined

   if (!conversationId || !senderId || !content) return

   const newMessage = {
     id: crypto.randomUUID(),
     conversationId,
     senderId,
     content,
     createdAt: new Date().toISOString(),
   }

   io.to(conversationId).emit('receive_message', newMessage)
   io.to(conversationId).emit('new_message', newMessage)
  })

  socket.on('mark_read', async ({ conversationId }: ConversationEvent) => {
   const userId = socket.data.userId as string | undefined
   if (!conversationId || !userId) return

   io.to(conversationId).emit('message_read', { conversationId, userId })
   io.to(conversationId).emit('conversation_read', { conversationId, userId })
  })

  socket.on('disconnect', () => {
   // Socket cleanup happens in the main connection handler.
  })
}
