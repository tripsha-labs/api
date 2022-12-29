/**
 * @name - Member schema
 * @description - Mongoose schema for Member.
 */
import mongoose, { Schema } from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', index: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    bookingId: { type: String, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isOwner: { type: Boolean, default: false, index: true },
    isMember: { type: Boolean, default: false, index: true },
    joinedOn: { type: String },
    leftOn: { type: String },
    isFavorite: { type: Boolean, default: false },
    favoriteOn: { type: String },
    unFavoriteOn: { type: String },
    removeRequested: { type: Boolean },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Member =
  mongoose.models.Member || mongoose.model('Member', memberSchema);
