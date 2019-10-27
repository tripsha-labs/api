/**
 * @name - Conversation schema
 * @description - Mongoose schema for Conversation
 */

import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    connectionId: String,
    awsUsername: String,
    tripId: { type: String, index: true },
    joinedOn: String,
    leftOn: String,
    memberId: { type: String, index: true },
    message: String,
    messageType: { type: String, default: 'text' },
    isOnline: { type: Boolean, default: false },
    lastOnlineTime: String,
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
