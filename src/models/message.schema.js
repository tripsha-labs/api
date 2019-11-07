/**
 * @name - Mongoose schema for Message model
 */
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    toMemberId: { type: String },
    tripId: { type: String },
    fromMemberId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    messageType: { type: String, default: 'text' },
    mediaUrl: { type: String, default: '' },
    isGroupMessage: { type: String, default: false },
    isEdited: { type: String, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Message =
  mongoose.models.Message || mongoose.model('Message', messageSchema);
