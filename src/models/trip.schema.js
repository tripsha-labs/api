/**
 * @name - Trip schema
 * @description - Mongoose trip schema.
 */
import mongoose, { Schema } from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    // Project fields
    name: { type: String, index: true },
    hiddenAttendees: { type: Object, optional: true, default: {} }, // Hide attendees per view
    showAttendees: { type: Boolean, default: false }, // for travelers
    showAttendeesCount: { type: Boolean, default: false }, // for travelers
    budget: { type: Object, optional: true, default: {} },
    questions: { type: Array, default: [] },
    draft: { type: Object, default: {} }, // All draft trip page details stored here
    lastPublishedDate: { type: Number },
    lastSavedDate: { type: Number },
    // Trip page fields controlled from UI
    title: { type: String, index: true, optional: true },
    description: { type: String, optional: true },
    startDate: { type: Number, index: true, optional: true },
    endDate: { type: Number, index: true, optional: true },
    focus: { type: String, optional: true },
    destinations: { type: Array, default: [], optional: true },
    minGroupSize: { type: Number, default: 2, optional: true },
    maxGroupSize: { type: Number, default: 20, optional: true },
    spotsAvailable: { type: Number, optional: true },
    languages: { type: Array, default: [], optional: true },
    interests: { type: Array, default: [], optional: true },
    pictureUrls: { type: Array, default: [], optional: true },
    thumbnailUrls: { type: Array, default: [], optional: true },
    itineraries: { type: Array, default: [], optional: true },
    rooms: { type: Array, default: [], optional: true },
    venues: { type: Array, default: [], optional: true },
    menuItems: { type: Array, default: [], optional: true },
    addOns: { type: Array, default: [] },
    deposit: { type: Object, default: {} },
    discount: { type: Object, default: {} },
    isDepositApplicable: { type: Boolean, default: false },
    isDiscountApplicable: { type: Boolean, default: false },
    tripPaymentType: {
      type: String,
      enum: ['pay', 'payasyougo', 'free'],
      default: 'pay',
    },
    priceIncludes: { type: String, optional: true },
    priceExcludes: { type: String, optional: true },
    lastBookingDate: { type: Number, optional: true },
    showGroupHistory: { type: Boolean, default: false },
    isAutoPayEnabled: { type: Boolean, default: false },
    bookingExpiryDays: { type: Number, default: 3 },
    isRSVPEnabled: { type: Boolean, default: false },
    autoRegisterRSVP: { type: Boolean, default: false },
    isBookingEnabled: { type: Boolean, default: false },
    autoAcceptBookingRequest: { type: Boolean, default: false },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organizations',
      index: true,
    },
    // Trip fields handled from backend
    status: {
      type: String,
      enum: ['created', 'draft', 'published', 'completed', 'canceled'],
      index: true,
      default: 'created',
    },
    guestCount: { type: Number, default: 0 },
    externalCount: { type: Number, default: 0 },
    hostCount: { type: Number, default: 1 },
    spotsFilled: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    tripLength: { type: Number, default: 0 },
    groupSize: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    isConversationArchived: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isFull: { type: Boolean, default: false },
    spotsReserved: { type: Number, default: 0 },
    removeRequested: { type: Boolean, default: false },
    allowExpressCheckout: { type: Boolean, default: false },
    coHosts: { type: Array, default: [], optional: true },
    location: { type: String, optional: true },

    // Traveler Filters
    travelerViewName: { type: String, optional: true },
    travelerViews: { type: Array, default: [], optional: true },
    travelerCustomColumns: { type: Array, default: [], optional: true },

    // View states
    paymentViews: { type: Array, default: [], optional: true },
    attendeeView: { type: Array, default: [], optional: true },
    linksView: { type: Array, default: [], optional: true },
    userPermissionsView: { type: Array, default: [], optional: true },
    questionsView: { type: Array, default: [], optional: true },
    allowMultipleOptions: { type: Boolean, default: false },
    travelerNotifications: { type: Array, default: [], optional: true },
    hostNotifications: { type: Array, default: [], optional: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
