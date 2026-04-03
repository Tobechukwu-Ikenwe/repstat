const { prisma } = require('../config/db');
const Message = require('../models/mongo/Message');

const createRoom = async (req, res) => {
  try {
    const { name, type } = req.body; // type is 'direct' or 'group'
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = await prisma.room.create({
      data: {
        name,
        type: type || 'group',
        memberships: {
          create: {
            userId,
            role: 'admin'
          }
        }
      }
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Check if room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Check if already joined
    const existing = await prisma.membership.findUnique({
      where: {
        userId_roomId: { userId, roomId }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already a member' });
    }

    const membership = await prisma.membership.create({
      data: {
        userId,
        roomId,
        role: 'member'
      }
    });

    res.json(membership);
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    // Authorization: is user a member?
    const membership = await prisma.membership.findUnique({
      where: {
        userId_roomId: { userId: req.user.id, roomId }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not authorized to view these messages' });
    }

    const query = { roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .exec();

    res.json(messages.reverse()); // Reverse to get chronological order for chat UI
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
};

const getUserRooms = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        memberships: {
          include: {
            room: true
          }
        }
      }
    });

    const rooms = user.memberships.map((m) => m.room);
    res.json(rooms);
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ error: 'Server error fetching rooms' });
  }
};

module.exports = { createRoom, joinRoom, getRoomMessages, getUserRooms };
