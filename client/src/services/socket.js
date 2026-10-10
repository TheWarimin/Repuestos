import { io } from 'socket.io-client';

let socket = null;

export const connectAdminSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io('/', {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket conectado:', socket.id);
    socket.emit('joinAdmin', token);
  });

  socket.on('disconnect', () => {
    console.log('Socket desconectado');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
