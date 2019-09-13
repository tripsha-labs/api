/**
 * @name - Mongoose schema for Message model
 */
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    toMemberId: { type: String, required: true, index: true },
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

export const Message =
  mongoose.models.Message || mongoose.model('Message', messageSchema);
