/**
 * @name - Conversation schema
 * @description - Mongoose schema for Conversation.
 */

import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    tripId: { type: String, index: true },
    isGroup: { type: Boolean, default: false, index: true },
    joinedOn: String,
    leftOn: String,
    memberId: { type: String, index: true },
    message: String,
    messageType: { type: String, default: 'text' },
    mediaUrl: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    lastReadAt: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model('Conversation', conversationSchema);
