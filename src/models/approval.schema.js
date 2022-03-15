/**
 * @name - Approval schema
 * @description - Mongoose schema for HostRequest.
 */

import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    tripId: { type: String },
    memberId: { type: String },
    type: {
      type: String,
      enum: ['TripRemove', 'MemberRemove'],
    },
    userId: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approve', 'decline', 'cancel'],
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
