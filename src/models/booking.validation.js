/**
 * @name - Booking validator
 * @description - This Booking schema validator
 */
import Validator from 'fastest-validator';

const bookingSchema = {
  tripId: { type: 'string', empty: false },
  stripePaymentMethod: { type: 'object', empty: false, optional: true },
  currency: { type: 'string', optional: true, default: 'USD' },
  attendees: { type: 'number', empty: false, min: 1 },
  room: {
    type: 'object',
    optional: true,
    props: {
      id: { type: 'string' },
      name: { type: 'string' },
      cost: { type: 'number' },
      available: { type: 'number' },
    },
  },
  addOns: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      props: {
        id: { type: 'string' },
        name: { type: 'string' },
        cost: { type: 'number' },
        available: { type: 'number' },
      },
    },
  },
  paymentStatus: {
    type: 'string',
    enum: ['full', 'deposit', 'payasyougo'],
    empty: false,
  },
  message: { type: 'string', optional: true },
  deposit: {
    optional: true,
    type: 'object',
    props: {
      amount: { type: 'number', positive: true },
      expirationDate: { type: 'number' },
      includeAddOns: { type: 'boolean' },
    },
  },
  discount: {
    type: 'object',
    props: {
      name: { type: 'string' },
      discType: { type: 'enum', values: ['amount', 'percentage'] },
      amount: { type: 'number' },
      expirationDate: { type: 'number' },
      includeAddOns: { type: 'boolean' },
    },
  },
  guests: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      props: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        relationship: { type: 'string' },
        username: { type: 'string', optional: true },
      },
    },
  },
  $$strict: 'remove',
};

export const createBookingValidation = new Validator().compile(bookingSchema);

export const hostBookingActionValidation = new Validator().compile({
  action: {
    type: 'string',
    enum: ['approve', 'decline', 'withdraw'],
    empty: false,
  },
  $$strict: 'remove',
});
