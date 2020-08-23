/**
 * @name - Member schema
 * @description - Mongoose db schema for Member
 */
import mongoose, { Schema } from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    memberId: { type: Schema.Types.ObjectId, ref: 'User' },
    bookingId: { type: String },
    isActive: { type: Boolean, default: true },
    isOwner: { type: Boolean, default: false },
    isMember: { type: Boolean, default: false },
    joinedOn: { type: String },
    leftOn: { type: String },
    isFavorite: { type: Boolean, default: false },
    favoriteOn: { type: String },
    unFavoriteOn: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Member =
  mongoose.models.Member || mongoose.model('Member', memberSchema);
