import express from 'express';
import { Channel } from '../models/Channel.js';

const router = express.Router();

// Get all channels
router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: 1 });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new channel
router.post('/', async (req, res) => {
  try {
    let { name, description } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Channel name must be at least 2 characters.' });
    }

    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');
    const existing = await Channel.findOne({ name: cleanName });
    if (existing) {
      return res.status(409).json({ error: 'A channel with this name already exists.' });
    }

    const channel = await Channel.create({
      name: cleanName,
      description: (description || '').trim(),
    });

    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get channel by ID
router.get('/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
