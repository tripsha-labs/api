/**
 * @name - Approval schema
 * @description - Mongouse schema for HostRequest.
 */

import mongoose, { Schema } from 'mongoose';

const memberDirectorySchema = new mongoose.Schema(
  {
    email: { type: String },
    name: { type: String },
    livesIn: { type: String },
    company: { type: String },
    team: { type: String },
    tripshaId: { type: Schema.Types.ObjectId },
    hostId: { type: String },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const MemberDirectory =
  mongoose.models.MemberDirectory ||
  mongoose.model('MemberDirectory', memberDirectorySchema);
