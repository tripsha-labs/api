/**
 * @name - Booking schema
 * @description - This is mongoose booking schema
 */
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    tripId: { type: String },
    onwerId: { type: String },
    memberId: { type: String },
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
        'pending',
        'approved',
        'declined',
        'withdrawn',
        'expired',
        'cancelled',
        'removed',
      ],
      default: 'pending',
    },
    // Payment details
    nextPaymentDate: { type: Object },
    totalBaseFare: { type: Number, default: 0 },
    totalAddonFare: { type: Number, default: 0 },
    discountBaseFare: { type: Number, default: 0 },
    discountAddonFare: { type: Number, default: 0 },
    totalFare: { type: Number, default: 0 },
    currentDue: { type: Number, default: 0 },
    paidAmout: { type: Number, default: 0 },
    pendingAmout: { type: Number, default: 0 },
    paymentHistory: { type: Array },
    addedByHost: { type: Boolean, default: false },
    tripPaymentType: { type: String },
    is48hEmailSent: { type: Boolean, default: false },
    is24hEmailSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Booking =
  mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
