/**
 * @name - Mongoose schema for Group Message model
 */
import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    fromMemberId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    messageType: { type: String, default: 'text' },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const GroupMessage =
  mongoose.models.GroupMessage ||
  mongoose.model('GroupMessage', groupMessageSchema);
