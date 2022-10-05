/**
 * @name - Trip validator
 * @description - Trip schema validator.
 */
import Validator from 'fastest-validator';
import moment from 'moment';
import { DATE_FORMAT } from '../constants/constants';

const tripSchema = {
  title: { type: 'string', empty: false },
  description: { type: 'string', optional: true },
  startDate: { type: 'number', empty: false },
  endDate: { type: 'number', empty: false },
  focus: {
    type: 'string',
    optional: true,
    empty: true,
  },
  destinations: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  tripPaymentType: {
    type: 'string',
    empty: false,
    enum: ['pay', 'payasyougo', 'free'],
  },
  minGroupSize: {
    type: 'number',
    min: 2,
    max: 500,
    empty: false,
    positive: true,
    integer: true,
  },
  maxGroupSize: {
    type: 'number',
    min: 2,
    max: 500,
    empty: false,
    positive: true,
    integer: true,
  },
  externalCount: {
    type: 'number',
    min: 0,
    max: 500,
    empty: false,
    integer: true,
  },
  languages: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  pictureUrls: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  thumbnailUrls: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  interests: {
    type: 'array',
    max: 18,
    optional: true,
    items: 'string',
  },
  itineraries: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      optional: true,
      props: {
        id: { type: 'string' },
        title: { type: 'string', optional: true },
        description: { type: 'string', optional: true },
        imageUrl: { type: 'string', optional: true },
      },
    },
  },
  rooms: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      props: {
        id: { type: 'string' },
        name: { type: 'string' },
        primaryPictureId: { type: 'string' },
        variants: {
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
        pictureUrls: {
          type: 'array',
          optional: true,
          items: {
            type: 'object',
            props: {
              id: { type: 'string' },
              caption: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
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
        restrictPerTraveler: { type: 'boolean' },
      },
    },
  },
  isDepositApplicable: {
    type: 'boolean',
    empty: false,
    optional: true,
  },
  deposit: {
    optional: true,
    type: 'object',
    props: {
      amount: { type: 'number', positive: true },
      expirationDate: { type: 'number' },
      includeAddOns: { type: 'boolean' },
    },
  },
  isDiscountApplicable: {
    type: 'boolean',
    empty: false,
    optional: true,
  },
  discounts: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      props: {
        name: { type: 'string' },
        discType: { type: 'enum', values: ['amount', 'percentage'] },
        amount: { type: 'number' },
        expirationDate: { type: 'number' },
        includeAddOns: { type: 'boolean' },
      },
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
        hideQuestion: { type: 'boolean', optional: true },
        infoText: { type: 'string', optional: true },
        showOtherOption: { type: 'boolean', optional: true, default: false },
        showOtherText: { type: 'string', optional: true, default: 'Other' },
      },
    },
  },
  priceIncludes: { type: 'string', optional: true },
  priceExcludes: { type: 'string', optional: true },
  isPublic: { type: 'boolean', optional: true },
  lastBookingDate: { type: 'number', optional: true },
  status: { type: 'string', optional: true },
  showAttendees: { type: 'boolean', optional: true },
  allowExpressCheckout: { type: 'boolean', optional: true },
  isAutoPayEnabled: { type: 'boolean', optional: true },
  bookingExpiryDays: { type: 'number', optional: true },
  isRSVPEnabled: { type: 'boolean', optional: true },
  autoRegisterRSVP: { type: 'boolean', optional: true },
  isBookingEnabled: { type: 'boolean', optional: true },
  autoAcceptBookingRequest: { type: 'boolean', optional: true },
  coHosts: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      optional: true,
      props: {
        id: { type: 'string' },
        addedBy: { type: 'number' },
        addedAt: { type: 'number' },
      },
    },
  },
  $$strict: 'remove',
};

const tripUpdateSchema = {
  ...tripSchema,
  title: { ...tripSchema.title, optional: true },
  startDate: { ...tripSchema.startDate, optional: true },
  endDate: { ...tripSchema.endDate, optional: true },
  tripPaymentType: { ...tripSchema.tripPaymentType, optional: true },
  minGroupSize: {
    ...tripSchema.minGroupSize,
    optional: true,
  },
  maxGroupSize: {
    ...tripSchema.maxGroupSize,
    optional: true,
  },
  externalCount: {
    ...tripSchema.externalCount,
    optional: true,
  },
  rooms: {
    ...tripSchema.rooms,
    optional: true,
  },
  isDiscountApplicable: {
    ...tripSchema.isDiscountApplicable,
    optional: true,
  },
  isDepositApplicable: {
    ...tripSchema.isDepositApplicable,
    optional: true,
  },
  travelerViewName: {
    type: 'string',
    optional: true,
  },
  travelerCustomColumns: {
    type: 'array',
    optional: true,
  },
  travelerViews: {
    type: 'array',
    optional: true,
  },
  paymentViews: {
    type: 'array',
    optional: true,
  },
  questionsView: {
    type: 'array',
    optional: true,
  },
  attendeeView: {
    type: 'array',
    optional: true,
  },
};

const draftpSchema = {
  title: { type: 'string', empty: false },
  pictureUrls: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  thumbnailUrls: {
    type: 'array',
    optional: true,
    items: 'string',
  },
};
export const validateTripLength = (startDate, endDate) => {
  try {
    startDate = moment(startDate, DATE_FORMAT);
    endDate = moment(endDate, DATE_FORMAT);
    return endDate.diff(startDate, 'days');
  } catch (err) {
    return -1;
  }
};

export const draftTripValidation = new Validator().compile(draftpSchema);
export const createTripValidation = new Validator().compile(tripSchema);
export const updateTripValidation = new Validator().compile(tripUpdateSchema);
