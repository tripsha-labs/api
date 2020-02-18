/**
 * @name - Trip schema
 * @description - This is trip mongoose trip schema
 */
import mongoose, { Schema } from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: String,
    startDate: { type: Number, required: true },
    endDate: { type: Number, required: true },
    focus: String,
    minGroupSize: Number,
    maxGroupSize: Number,
    groupSize: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    tripLength: { type: Number, default: 0 },
    itinerary: { type: Array, default: [] },
    priceIncludes: { type: String },
    priceExcludes: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    isFull: { type: Boolean, default: false },
    spotsFilled: { type: Number, default: 0 },
    spotsAvailable: Number,
    destinations: [String],
    languages: [String],
    interests: [String],
    pictureUrls: [String],
    showGroupHistory: { type: Boolean, default: true },
    depositAmount: { type: Number, required: false },
    depositExpirationDate: { type: Number, required: false },
    depositAndAddOns: { type: Boolean, default: true },
    rooms: { type: Array, default: [] },
    addOns: { type: Array, default: [] },
    discount: {
      discType: {
        type: String,
        enum: ['usd', 'percentage'],
        default: 'usd',
      },
      amount: Number,
      expirationDate: Number,
      includeAddOns: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
