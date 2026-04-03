const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const jwt = require('jsonwebtoken');
const registerChatHandlers = require('./handlers');

const initSocketIO = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust for prod
      methods: ['GET', 'POST']
    }
  });

  // Redis Adapter Setup for Scaling Multiple Node Instances
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Redis Adapter for Socket.io initialized');
    } catch (err) {
      console.error('❌ Redis Adapter initialization failed', err);
    }
  }

  // Auth Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    if (!token) {
      return next(new Error('Authentication error: No token'));
    }
    
    try {
      const decodedToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);
      socket.user = decoded; // Attach user payload to socket
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid Token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.user.username} (${socket.user.id}) connected`);
    
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.user.username} disconnected`);
      socket.broadcast.emit('user_status', { userId: socket.user.id, status: 'offline' });
    });
  });

  return io;
};

module.exports = initSocketIO;
