/**
 * @name - Booking validator
 * @description - This Booking schema validator
 */
import Validator from 'fastest-validator';

const bookingSchema = {
  tripId: { type: 'string', empty: false },
  guestId: { type: 'string', optional: true },
  stripePaymentMethod: { type: 'string', empty: false },
  status: {
    type: 'enum',
    values: [
      'pending_approval',
      'approved',
      'deposit_paid',
      'paid',
      'rejected',
      'canceled',
    ],
    optional: true,
  },
  currency: { type: 'string', optional: true },
  totalAmount: { type: 'number', positive: true },
  deposit: { type: 'number', optional: true },
  payments: { type: 'array', items: 'number', optional: true },
  $$strict: true,
};

const bookingUpdateSchema = {
  ...bookingSchema,
  tripId: { type: 'string', empty: false, optional: true },
  stripePaymentMethod: { type: 'string', empty: false, optional: true },
  totalAmount: { type: 'number', positive: true, optional: true },
};

export const createBookingValidation = new Validator().compile(bookingSchema);
export const updateBookingValidation = new Validator().compile(
  bookingUpdateSchema
);
