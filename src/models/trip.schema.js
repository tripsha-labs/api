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
    startDate: { type: Number, index: true },
    endDate: { type: Number, index: true },
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
      index: true,
    },

    // Backend generated fields
    guestCount: { type: Number, default: 0 },
    externalCount: { type: Number, default: 0 },
    hostCount: { type: Number, default: 1 },
    spotsFilled: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    tripLength: { type: Number, default: 0 },
    groupSize: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    isConversationArchived: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isFull: { type: Boolean, default: false },
    spotsReserved: { type: Number, default: 0 },
    showGroupHistory: { type: Boolean, default: true },
    removeRequested: { type: Boolean, default: false },
    showAttendees: { type: Boolean, default: false },
    allowExpressCheckout: { type: Boolean, default: false },
    isAutoPayEnabled: { type: Boolean, default: true },
    bookingExpiryDays: { type: Number, default: 3 },
    isRSVPEnabled: { type: Boolean, default: true },
    autoRegisterRSVP: { type: Boolean, default: true },
    isBookingEnabled: { type: Boolean, default: true },
    autoAcceptBookingRequest: { type: Boolean, default: true },
    // Traveler Filters
    travelerViewName: { type: String, optional: true },
    travelerCustomColumns: { type: Array, default: [], optional: true },
    travelerViews: { type: Array, default: [], optional: true },
    // Payment filters
    paymentViews: { type: Array, default: [], optional: true },
    attendeeView: { type: Array, optional: true },
    linksView: { type: Array, optional: true },
    userPermissionsView: { type: Array, optional: true },
    questionsView: { type: Array, optional: true },
    hiddenAttendees: { type: Object, optional: true },
    coHosts: { type: Array, optional: true },
    budget: { type: Object, optional: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
