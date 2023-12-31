/**
 * @name - Booking validator
 * @description - The Booking schema validator.
 */
import Validator from 'fastest-validator';

const bookingSchema = {
  tripId: { type: 'string', empty: false },
  stripePaymentMethod: { type: 'object', empty: false, optional: true },
  paymentMethod: { type: 'string', empty: false, optional: true },
  currency: { type: 'string', optional: true, default: 'USD' },
  attendees: { type: 'number', empty: false, min: 1 },
  rooms: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      props: {
        variant: {
          type: 'object',
          props: {
            id: { type: 'string' },
            name: { type: 'string' },
            cost: { type: 'number' },
            available: { type: 'number' },
          },
        },
        room: {
          type: 'object',
        },
        attendees: { type: 'number' },
      },
    },
  },
  addOns: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      props: {
        variant: {
          type: 'object',
          props: {
            id: { type: 'string' },
            name: { type: 'string' },
            cost: { type: 'number' },
            available: { type: 'number' },
          },
        },
        addOn: {
          type: 'object',
        },
        attendees: { type: 'number' },
      },
    },
  },
  paymentStatus: {
    type: 'string',
    enum: ['full', 'deposit', 'payasyougo', 'free'],
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
  questions: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      props: {
        id: { type: 'string' },
        questionText: { type: 'string' },
        type: {
          type: 'enum',
          values: [
            'OneLine',
            'MultiLine',
            'OneChoice',
            'MultiChoice',
            'UploadFile',
            'Url',
            'Date',
            'DateRange',
            'DateTime',
            'Time',
            'Consent',
            'YesNo',
          ],
        },
        options: {
          type: 'array',
          optional: true,
          items: {
            type: 'object',
            props: {
              id: { type: 'string' },
              optionText: { type: 'string' },
            },
          },
        },
        isRequired: { type: 'boolean', optional: true },
        showAtBooking: { type: 'boolean', optional: true },
        showAtRSVP: { type: 'boolean', optional: true },
        showQuestion: { type: 'boolean', optional: true },
        answer: {
          type: 'any',
          optional: true,
        },
        infoText: { type: 'string', optional: true },
        showOtherOption: { type: 'boolean', optional: true, default: false },
        showOtherText: { type: 'string', optional: true, default: 'Other' },
        lockResponse: { type: 'boolean', optional: true, default: false },
        answerDeadline: { type: 'number', optional: true },
      },
    },
  },
  discount: {
    type: 'object',
    optional: true,
    props: {
      name: { type: 'string' },
      discType: { type: 'enum', values: ['amount', 'percentage'] },
      amount: { type: 'number' },
      expirationDate: { type: 'number' },
      includeAddOns: { type: 'boolean' },
    },
  },
  coupon: {
    type: 'object',
    optional: true,
    props: {
      discType: { type: 'enum', values: ['amount', 'percentage'] },
      amount: { type: 'number' },
      couponCode: { type: 'string' },
      _id: { type: 'string' },
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
const updateBookingSchema = {
  message: { type: 'string', optional: true },
  customFields: { type: 'object', optional: true },
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
export const createInviteValidation = new Validator().compile({
  tripId: { type: 'string', empty: false },
  emails: {
    type: 'array',
    empty: false,
    items: {
      type: 'email',
    },
    save_to_members: {
      type: 'bolean',
      optional: true,
    },
    send_invite: {
      type: 'bolean',
      optional: true,
    },
    direct_attendee: { type: 'bolean', optional: true },
  },
  $$strict: 'remove',
});
export const createBookingValidation = new Validator().compile(bookingSchema);

export const updateBookingValidation = new Validator().compile(
  updateBookingSchema
);

export const hostBookingActionValidation = new Validator().compile({
  action: {
    type: 'string',
    enum: ['approve', 'decline', 'withdraw'],
    empty: false,
  },
  stripePaymentMethod: { type: 'object', empty: false, optional: true },
  paymentMethod: { type: 'string', empty: false, optional: true },
  forceAddTraveler: { type: 'boolean', empty: true, optional: true },
  reason: { type: 'string', empty: true, optional: true },
  comments: { type: 'array', items: 'string', empty: true, optional: true },
  $$strict: 'remove',
});
