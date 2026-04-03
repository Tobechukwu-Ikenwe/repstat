const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController');
const roomController = require('../controllers/roomController');
const mediaController = require('../controllers/mediaController');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);

// Room Routes
router.post('/rooms', authMiddleware, roomController.createRoom);
router.get('/rooms', authMiddleware, roomController.getUserRooms);
router.post('/rooms/:roomId/join', authMiddleware, roomController.joinRoom);
router.get('/rooms/:roomId/messages', authMiddleware, roomController.getRoomMessages);

// Media Routes
router.get('/media/presigned-url', authMiddleware, mediaController.getPresignedUrl);

module.exports = router;
