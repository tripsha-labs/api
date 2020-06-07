/**
 * @name - Trip schema
 * @description - This is trip mongoose trip schema
 */
import mongoose, { Schema } from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    // Fields collected from UI
    title: { type: String, index: true },
    description: { type: String },
    startDate: { type: Number },
    endDate: { type: Number },
    focus: { type: String },
    destinations: [String],
    minGroupSize: { type: Number, default: 2 },
    maxGroupSize: { type: Number, default: 20 },
    spotsAvailable: { type: Number },
    languages: [String],
    interests: [String],
    pictureUrls: [String],
    itineraries: { type: Array, default: [] },
    rooms: { type: Array, default: [] },
    addOns: { type: Array, default: [] },
    deposit: { type: Object },
    discounts: { type: Object },
    isDepositApplicable: { type: Boolean, default: false },
    isDiscountApplicable: { type: Boolean, default: false },
    priceIncludes: { type: String },
    priceExcludes: { type: String },
    lastBookingDate: Number,
    status: {
      type: String,
      enum: ['draft', 'published', 'completed', 'cancelled'],
    },

    // Backend generated fields
    spotsFilled: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    tripLength: { type: Number, default: 0 },
    groupSize: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isFull: { type: Boolean, default: false },
    showGroupHistory: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
