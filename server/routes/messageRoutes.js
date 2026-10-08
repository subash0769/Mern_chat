import express from 'express';
import { Message } from '../models/Message.js';

const router = express.Router();

// Get messages for a channel
router.get('/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;
    const messages = await Message.find({ channel: channelId })
      .sort({ createdAt: 1 })
      .limit(limit);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post a message in a channel (REST fallback if not using socket directly)
router.post('/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { sender, avatar, content } = req.body;

    if (!sender || !content || !content.trim()) {
      return res.status(400).json({ error: 'Sender and content are required.' });
    }

    const message = await Message.create({
      channel: channelId,
      sender: sender.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sender)}`,
      content: content.trim(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
