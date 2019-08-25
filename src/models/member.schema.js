import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    tripId: { type: String, required: true, index: true },
    memberId: { type: String, required: true, index: true },
    isActive: Boolean,
    isOwner: Boolean,
    isMember: Boolean,
    isFavorite: Boolean,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    strict: true,
  }
);
export const Member =
  mongoose.models.Member || mongoose.model('Member', memberSchema);
