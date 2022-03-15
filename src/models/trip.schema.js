/**
 * @name - Trip schema
 * @description - Mongoose trip schema.
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
    thumbnailUrls: [String],
    itineraries: { type: Array, default: [] },
    rooms: { type: Array, default: [] },
    addOns: { type: Array, default: [] },
    deposit: { type: Object },
    discounts: { type: Object },
    questions: { type: Array, default: [] },
    isDepositApplicable: { type: Boolean, default: false },
    isDiscountApplicable: { type: Boolean, default: false },
    tripPaymentType: {
      type: String,
      enum: ['pay', 'payasyougo', 'free'],
    },
    priceIncludes: { type: String },
    priceExcludes: { type: String },
    lastBookingDate: Number,
    status: {
      type: String,
      enum: ['draft', 'published', 'completed', 'cancelled'],
    },

    // Backend generated fields
    guestCount: { type: Number, default: 0 },
    externalCount: { type: Number, default: 0 },
    hostCount: { type: Number, default: 1 },
    spotsFilled: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    tripLength: { type: Number, default: 0 },
    groupSize: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    isConversationArchived: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isFull: { type: Boolean, default: false },
    spotsReserved: { type: Number, default: 0 },
    showGroupHistory: { type: Boolean, default: true },
    removeRequested: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
