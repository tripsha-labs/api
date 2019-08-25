import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: String,
    startDate: String,
    endDate: String,
    focus: String,
    cost: Number,
    minGroupSize: Number,
    maxGroupSize: Number,
    groupSize: Number,
    tripLength: Number,
    ownerId: String,
    isActive: Boolean,
    isPublic: Boolean,
    isArchived: Boolean,
    isFull: Boolean,
    spotsFilled: Number,
    destinations: [String],
    languages: [String],
    interests: [String],
    pictureUrls: [String],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    strict: true,
  }
);
export const Trip = mongoose.models.User || mongoose.model('Trip', tripSchema);
