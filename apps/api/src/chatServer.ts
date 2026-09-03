import http from 'node:http'
import JWT from 'jsonwebtoken'
import { Server, type Socket } from 'socket.io'

import { env } from './config/env.js'
import { registerChatHandlers } from './sockets/chatSocket.js'

const server = http.createServer()

export const io = new Server(server, {
  cors: {
   origin: env.corsOrigins,
   credentials: true,
   methods: ['GET', 'POST'],
  },
})

const onlineUsers = new Map<number, Set<string>>()

const getTokenFromSocket = (socket: Socket) => {
  const authToken = socket.handshake.auth?.token
  const headerToken = socket.handshake.headers.authorization

  if (typeof authToken === 'string' && authToken) {
   return authToken
  }

  if (typeof headerToken === 'string' && headerToken.startsWith('Bearer ')) {
   return headerToken.replace(/^Bearer\s+/i, '')
  }

  return null
}

const getUserIdFromSocket = (socket: Socket) => {
  const token = getTokenFromSocket(socket)

  if (!token) {
   return null
  }

  try {
   const decoded = JWT.verify(token, env.JWT_SECRET_KEY) as {
     userId?: string | number
   }

   const userId = Number(decoded.userId)
   return Number.isFinite(userId) ? userId : null
  } catch {
   return null
  }
}

io.on('connection', (socket: Socket) => {
  const userId = getUserIdFromSocket(socket)

  if (!userId) {
   socket.disconnect(true)
   return
  }

  if (!onlineUsers.has(userId)) {
   onlineUsers.set(userId, new Set())
   io.emit('user_online', userId)
  }

  onlineUsers.get(userId)?.add(socket.id)
  socket.emit('online_users', Array.from(onlineUsers.keys()))

  registerChatHandlers(socket, io)

  socket.on('disconnect', () => {
   const userSockets = onlineUsers.get(userId)
   if (!userSockets) return

   userSockets.delete(socket.id)

   if (userSockets.size === 0) {
     onlineUsers.delete(userId)
     io.emit('user_offline', userId)
   }
  })
})

export const startSocketServer = (port = env.SOCKET_PORT) => {
  return server.listen(port, () => {
   console.log(`Socket server running on port ${port}`)
  })
}

if (process.argv[1]?.endsWith('chatServer.ts') || process.argv[1]?.endsWith('chatServer.js')) {
  startSocketServer()
}

export { server, onlineUsers }
