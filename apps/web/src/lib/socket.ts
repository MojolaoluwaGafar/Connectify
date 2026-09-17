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

socket.on('connect', () => {
  console.log('SOCKET CONNECTED:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('SOCKET CONNECTION ERROR:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('SOCKET DISCONNECTED:', reason);
});

export const connectSocket = () => {
  const token = getAuthToken()

  if (!token) {
    return
  }

  socket.auth = { token }

  if (!socket.connected) {
    socket.connect()
  }
}

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect()
  }
}
