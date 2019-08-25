import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    toMemberId: { type: String, required: true, index: true },
    fromMemberId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    messageType: { type: String, default: 'text' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    strict: true,
  }
);
export const Message =
  mongoose.models.Message || mongoose.model('Message', messageSchema);
