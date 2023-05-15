/**
 * @name - Booking schema
 * @description - This is the mongoose booking schema.
 */
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    tripId: { type: String, index: true },
    onwerId: { type: String, index: true },
    memberId: { type: String, index: true },
    stripePaymentMethod: { type: Object },
    paymentMethod: { type: String },
    onwerStripeId: { type: String },
    memberStripeId: { type: String },
    // booking details
    currency: { type: String, default: 'US' },
    attendees: { type: Number },
    rooms: { type: Array },
    questions: { type: Array },
    addOns: { type: Array },
    guests: { type: Array },
    message: { type: String },
    reason: { type: String },
    comments: { type: Array },
    paymentStatus: {
      type: String,
      enum: ['full', 'deposit', 'payasyougo', 'free'],
    },
    deposit: { type: Object },
    discount: { type: Object },
    coupon: { type: Object },
    status: {
      type: String,
      enum: [
        'invite-pending',
        'invite-sent',
        'invite-accepted',
        'invite-declined',
        'invite-maybe',
        'pending',
        'approved',
        'declined',
        'withdrawn',
        'expired',
        'cancelled',
        'removed',
      ],
      default: 'pending',
      index: true,
    },
    // Payment details
    totalBaseFare: { type: Number, default: 0 },
    totalAddonFare: { type: Number, default: 0 },
    discountBaseFare: { type: Number, default: 0 },
    discountAddonFare: { type: Number, default: 0 },
    totalFare: { type: Number, default: 0 },
    currentDue: { type: Number, default: 0 },
    paidAmout: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    paymentHistory: { type: Array },
    addedByHost: { type: Boolean, default: false },
    tripPaymentType: { type: String },
    is48hEmailSent: { type: Boolean, default: false },
    is24hEmailSent: { type: Boolean, default: false },
    autoChargeDate: { type: Number },
    paymentRetryCount: { type: Number, default: 0 },
    paymentError: { type: Object },
    isAutoPayEnabled: { type: Boolean, default: true },
    bookingExpireOn: { type: Number, default: 3 },
    customFields: { type: Object },
    invited: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Booking =
  mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
