/**
 * @name - Member schema
 * @description - Mongoose schema for Member.
 */
import mongoose, { Schema } from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    // Below two should be unique
    tripId: { type: Schema.Types.ObjectId, index: true },
    memberId: { type: Schema.Types.ObjectId, index: true },

    bookingId: { type: Schema.Types.ObjectId, index: true }, // This is optional
    isActive: { type: Boolean, default: true }, // Record is valid or not
    isMember: { type: Boolean, default: false }, // Is registered member
    isFavorite: { type: Boolean, default: false }, // Is interated member
    isInvite: { type: Boolean, default: false }, // Is invited member
    joinedOn: { type: String },
    leftOn: { type: String },
    removeRequested: { type: Boolean }, // Is remove membership requested
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Member =
  mongoose.models.Member || mongoose.model('Member', memberSchema);
