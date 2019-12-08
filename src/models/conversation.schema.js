/**
 * @name - Conversation schema
 * @description - Mongoose schema for Conversation
 */

import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: String },
    tripId: { type: String },
    isGroup: { type: Boolean, default: false },
    joinedOn: String,
    leftOn: String,
    memberId: { type: String, index: true },
    message: String,
    messageType: { type: String, default: 'text' },
    mediaUrl: { type: String, default: '' },
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
