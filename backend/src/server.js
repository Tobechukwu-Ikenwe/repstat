require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDBs } = require('./config/db');
const initSocketIO = require('./socket/io');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Init databases
connectDBs();

// Initialize Socket.io
initSocketIO(server);

// Routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Chat backend is running' });
});

// Start Server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
