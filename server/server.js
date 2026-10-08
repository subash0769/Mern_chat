import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { Message } from './models/Message.js';
import { User } from './models/User.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mern-chat-server',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io event handling
const onlineUsers = new Map(); // socket.id -> { username, channelId }

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // User joins with profile
  socket.on('user_online', async ({ username }) => {
    onlineUsers.set(socket.id, { username, currentChannel: null });
    io.emit('online_users', Array.from(new Set(Array.from(onlineUsers.values()).map((u) => u.username))));
  });

  // User joins a channel room
  socket.on('join_channel', (channelId) => {
    socket.join(channelId);
    const user = onlineUsers.get(socket.id);
    if (user) {
      user.currentChannel = channelId;
      onlineUsers.set(socket.id, user);
    }
    console.log(`[Socket] ${socket.id} joined channel ${channelId}`);
  });

  // User leaves a channel room
  socket.on('leave_channel', (channelId) => {
    socket.leave(channelId);
    console.log(`[Socket] ${socket.id} left channel ${channelId}`);
  });

  // Sending message
  socket.on('send_message', async ({ channelId, sender, avatar, content }, callback) => {
    try {
      if (!channelId || !content || !content.trim()) return;

      const message = await Message.create({
        channel: channelId,
        sender: sender.trim(),
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sender)}`,
        content: content.trim(),
      });

      // Broadcast to all sockets in the channel room
      io.to(channelId).emit('new_message', message);

      if (callback) callback({ success: true, message });
    } catch (err) {
      console.error('[Socket] Error saving message:', err.message);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Typing indicators
  socket.on('typing', ({ channelId, username }) => {
    socket.to(channelId).emit('user_typing', { username, channelId });
  });

  socket.on('stop_typing', ({ channelId, username }) => {
    socket.to(channelId).emit('user_stop_typing', { username, channelId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    onlineUsers.delete(socket.id);
    io.emit('online_users', Array.from(new Set(Array.from(onlineUsers.values()).map((u) => u.username))));
  });
});

// Connect to DB and start listening
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[Server] MERN Chat Server listening on http://localhost:${PORT}`);
  });
});
