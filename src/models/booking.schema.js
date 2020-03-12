/**
 * @name - Booking schema
 * @description - This is mongoose booking schema
 */
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    tripId: { type: String, required: true },
    guestId: { type: String, required: true },
    stripePaymentMethod: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'pending_approval',
        'approved',
        'deposit_paid',
        'paid',
        'rejected',
        'canceled',
      ],
      default: 'pending_approval',
    },
    currency: { type: String, default: 'USD' },
    totalAmount: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    payments: [Number],
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Booking =
  mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
