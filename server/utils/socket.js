let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // El admin se une a la sala "admin"
    socket.on('joinAdmin', (token) => {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
          socket.join('admin');
          console.log(`Admin unido a sala admin: ${socket.id}`);
          socket.emit('adminJoined', { message: 'Conectado al panel de notificaciones' });
        }
      } catch {
        socket.emit('error', { message: 'Token inválido' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!ioInstance) throw new Error('Socket.io no inicializado');
  return ioInstance;
};

module.exports = { initSocket, getIO };
