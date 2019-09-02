import mongoose, { Schema } from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    memberId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    isOwner: { type: Boolean, default: false },
    isMember: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Member =
  mongoose.models.Member || mongoose.model('Member', memberSchema);
