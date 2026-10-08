import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Channel } from './models/Channel.js';
import { Message } from './models/Message.js';
import { User } from './models/User.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp';

const seedData = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing
    await Channel.deleteMany({});
    await Message.deleteMany({});
    await User.deleteMany({});

    // Seed channels
    const channels = await Channel.insertMany([
      { name: 'general', description: 'General company & team discussions' },
      { name: 'random', description: 'Water cooler chat, memes, and fun topics' },
      { name: 'tech-talk', description: 'Architecture, libraries, debugging, and code reviews' },
      { name: 'announcements', description: 'Important updates and product releases' },
    ]);

    console.log(`[Seed] Seeded ${channels.length} channels.`);

    // Seed sample bot user and welcome message
    const botUser = await User.create({
      username: 'BotBuddy',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BotBuddy',
      status: 'online',
    });

    const generalChannel = channels.find((c) => c.name === 'general');
    if (generalChannel) {
      await Message.create({
        channel: generalChannel._id,
        sender: botUser.username,
        avatar: botUser.avatar,
        content: '👋 Welcome to the MERN Real-time Chat App! Join a channel or create your own to start chatting.',
      });
      console.log('[Seed] Added welcome message.');
    }

    console.log('[Seed] Data seeded successfully! 🎉');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
