/**
 * @name - Trip schema
 * @description - This is trip mongoose trip schema
 */
import mongoose, { Schema } from 'mongoose';

const ItinerarySchema = new Schema({
  description: String,
  imageUrl: String,
});

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: String,
    startDate: { type: Number, required: true },
    endDate: { type: Number, required: true },
    focus: String,
    cost: Number,
    minGroupSize: Number,
    maxGroupSize: Number,
    groupSize: { type: Number, default: 0 },
    tripLength: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    isFull: { type: Boolean, default: false },
    spotsFilled: { type: Number, default: 0 },
    destinations: [String],
    languages: [String],
    interests: [String],
    pictureUrls: [String],
    intinerary: [ItinerarySchema],
    priceIncludes: String,
    priceExcludes: String,
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
