import http from 'node:http'
import { connectDatabase } from './config/database.js'
import { Server, type Socket } from 'socket.io'

import { env } from './config/env.js'
import { verifyAuthToken } from './core/auth/token.js'
import { registerChatHandlers } from './sockets/chatSocket.js'

const server = http.createServer()

export const io = new Server(server, {
  cors: {
   origin: env.corsOrigins,
   credentials: true,
   methods: ['GET', 'POST'],
  },
})

const onlineUsers = new Map<string, Set<string>>()

// Internal-only bridge: the REST API runs as a separate process (server.ts)
// and has no direct reference to this `io` instance, so it reaches it over
// HTTP to push events like "new_match" in realtime. Guarded by a shared
// secret since this endpoint isn't meant to be reachable by end clients.
function readJsonBody(request: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

server.on('request', (request, response) => {
  if (request.method !== 'POST' || request.url !== '/internal/notify-match') {
    return
  }

  if (request.headers['x-internal-secret'] !== env.INTERNAL_SOCKET_SECRET) {
    response.writeHead(401).end()
    return
  }

  readJsonBody(request)
    .then(({ recipientId, profile }) => {
      if (!recipientId || !profile) {
        response.writeHead(400).end()
        return
      }

      io.to(recipientId).emit('new_match', { profile })
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ ok: true }))
    })
    .catch(() => {
      response.writeHead(400).end()
    })
})

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

  return verifyAuthToken(token)?.id ?? null
}

io.on('connection', (socket: Socket) => {
  const userId = getUserIdFromSocket(socket)

  if (!userId) {
   socket.disconnect(true)
   return
  }

  socket.data.userId = userId

  // A personal room reachable by userId — lets us push events (new
  // matches, message notifications) straight to a user regardless of
  // which conversation, if any, they currently have open.
  socket.join(userId)

  if (!onlineUsers.has(userId)) {
   onlineUsers.set(userId, new Set())
   io.emit('user_online', userId)
  }

  onlineUsers.get(userId)?.add(socket.id)
  socket.emit('online_users', Array.from(onlineUsers.keys()))

  // Components that mount well after this initial connection (e.g. a
  // ChatWindow opened later in the session) missed the emit above, so
  // they can ask for a fresh snapshot on demand instead of relying on it.
  socket.on('get_online_users', () => {
    socket.emit('online_users', Array.from(onlineUsers.keys()))
  })

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

if (
  process.argv[1]?.endsWith('chatServer.ts') ||
  process.argv[1]?.endsWith('chatServer.js')
) {
  connectDatabase()
    .then(() => {
      startSocketServer()
    })
    .catch((error) => {
      console.error('Failed to start chat server:', error)
      process.exit(1)
    })
}

export { server, onlineUsers }
