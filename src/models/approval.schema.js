/**
 * @name - Approval schema
 * @description - Mongouse schema for HostRequest
 */

import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    tripId: { type: String, required: true },
    memberId: { type: String },
    type: {
      type: String,
      required: true,
      enum: ['TripRemove', 'MemberRemove'],
    },
    userId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
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
