import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    connectionId: String,
    awsUsername: String,
    message: String,
    messageType: { type: String, default: 'text' },
    isOnline: { type: Boolean, default: false },
    lastOnlineTime: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    strict: true,
  }
);
export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model('Conversation', conversationSchema);
