import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model('Message', messageSchema);
