/**
 * @name - Trip validator
 * @description - This Trip schema validator
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
        title: { type: 'string' },
        description: { type: 'string' },
        imageUrl: { type: 'string' },
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
          values: ['OneLine', 'MultiLine', 'OneChoice', 'MultiChoice'],
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
        isRequired: { type: 'boolean' },
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
  status: { type: 'string' },
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

export const createTripValidation = new Validator().compile(tripSchema);
export const updateTripValidation = new Validator().compile(tripUpdateSchema);
