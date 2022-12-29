/**
 * @name - Approval schema
 * @description - Mongoose schema for HostRequest.
 */

import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    tripId: { type: String, index: true },
    memberId: { type: String, index: true },
    type: {
      type: String,
      enum: ['TripRemove', 'MemberRemove'],
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approve', 'decline', 'cancel'],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Approval =
  mongoose.models.Approvals || mongoose.model('Approvals', approvalSchema);
