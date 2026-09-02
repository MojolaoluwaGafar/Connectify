import { io } from 'socket.io-client'

import { getAuthToken } from '../utils/authToken'

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ??
  import.meta.env.VITE_WS_URL ??
  'http://localhost:3002'

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket'],
  reconnectionAttempts: 5,
})

export const connectSocket = (userId?: string | number) => {
  const token = getAuthToken()

  if (!userId || !token) {
    return
  }

  socket.auth = { token, userId: Number(userId) }

  if (!socket.connected) {
    socket.connect()
  }
}

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect()
  }
}
