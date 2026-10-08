import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 30,
    },
    description: {
      type: String,
      default: '',
      maxlength: 150,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Channel = mongoose.model('Channel', channelSchema);
