import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ updatedAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or login user (upsert by username)
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.trim().length < 2) {
      return res.status(400).json({ error: 'Username must be at least 2 characters long.' });
    }

    const cleanUsername = username.trim();
    // Default avatar using dicebear or ui-avatars
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`;

    let user = await User.findOne({ username: cleanUsername });
    if (!user) {
      user = await User.create({ username: cleanUsername, avatar, status: 'online' });
    } else {
      user.status = 'online';
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
