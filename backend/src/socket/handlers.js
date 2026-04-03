const Message = require('../models/mongo/Message');
const { prisma } = require('../config/db');

module.exports = (io, socket) => {
  socket.on('join_room', async ({ roomId }) => {
    socket.join(roomId);
    
    // Broadcast user presence safely
    socket.to(roomId).emit('user_status', {
      userId: socket.user.id,
      status: 'online',
      roomId
    });
  });

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
  });

  socket.on('send_message', async (data) => {
    try {
      const { roomId, content, type, mediaUrl } = data;

      // 1. Verify Authorization in DB
      const membership = await prisma.membership.findUnique({
        where: {
          userId_roomId: { userId: socket.user.id, roomId }
        }
      });

      if (!membership) {
        socket.emit('error', { message: 'Not authorized for this room' });
        return;
      }

      // 2. Persist to MongoDB Document DB fast storage
      const messageDoc = await Message.create({
        roomId,
        senderId: socket.user.id,
        senderName: socket.user.username,
        content,
        type: type || 'text',
        mediaUrl
      });

      // 3. Redis Pub/Sub broadcast via socket.io to the specific room across all node servers
      io.to(roomId).emit('receive_message', messageDoc);
      
    } catch (err) {
      console.error('send_message error', err);
      socket.emit('error', { message: 'Failed to complete send_message' });
    }
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('user_typing', {
      userId: socket.user.id,
      username: socket.user.username,
      isTyping,
      roomId
    });
  });
};
