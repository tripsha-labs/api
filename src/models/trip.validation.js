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
  tripLength: { type: 'number', optional: true },
  location: { type: 'string', optional: true },
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
    items: {
      type: 'object',
      props: {
        id: { type: 'string' },
        title: { type: 'string', empty: false },
        events: {
          type: 'array',
          items: {
            type: 'object',
            props: {
              id: { type: 'string' },
              title: {
                type: 'string',
                empty: false,
                label: 'Title',
              },
              description: { type: 'string', optional: true },
              duration: { type: 'number', optional: true },
              durationUnit: { type: 'string', enum: ['Min', 'Hrs'] },
              location: {
                type: 'string',
                optional: true,
                label: 'Location',
              },
              startTime: {
                type: 'string',
                optional: true,
              },
            },
          },
        },
      },
    },
  },
  venues: {
    type: 'array',
    items: {
      type: 'object',
      props: {
        id: { type: 'string' },
        title: { type: 'string', empty: false },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            props: {
              id: { type: 'string' },
              title: {
                type: 'string',
                empty: false,
                label: 'Title',
              },
              description: {
                type: 'string',
                optional: true,
                label: 'Description',
              },
              location: {
                type: 'string',
                optional: true,
                label: 'Location',
              },
              images: {
                type: 'array',
                optional: true,
                items: {
                  type: 'object',
                  props: {
                    id: { type: 'string' },
                    url: {
                      type: 'string',
                      label: 'Url',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  rooms: {
    type: 'array',
    items: {
      type: 'object',
      props: {
        id: { type: 'string' },
        name: { type: 'string', empty: false },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            props: {
              id: { type: 'string' },
              name: {
                type: 'string',
                empty: false,
                label: 'Title',
              },
              cost: {
                type: 'number',
                optional: true,
                label: 'Cost',
              },
              available: {
                type: 'number',
                empty: false,
                label: 'Maximum that can be booked',
              },
              location: {
                type: 'string',
                optional: true,
                label: 'Location',
              },
              images: {
                type: 'array',
                optional: true,
                items: {
                  type: 'object',
                  props: {
                    id: { type: 'string' },
                    url: {
                      type: 'string',
                      label: 'Photos',
                    },
                  },
                },
              },
              description: {
                type: 'string',
                optional: true,
                label: 'Description',
              },
            },
          },
        },
      },
    },
  },
  addOns: {
    type: 'array',
    items: {
      type: 'object',
      props: {
        id: { type: 'string' },
        name: { type: 'string', empty: false, label: 'Title' },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            props: {
              id: { type: 'string' },
              name: {
                type: 'string',
                empty: false,
                label: 'Title',
              },
              cost: {
                type: 'number',
                optional: true,
                label: 'Cost',
              },
              available: {
                type: 'number',
                empty: false,
                label: 'Maximum that can be booked',
              },
              restrictPerTraveler: {
                type: 'boolean',
                optional: true,
                label: 'Restrict add-on to a maximum of one per traveler',
              },
              images: {
                type: 'array',
                optional: true,
                items: {
                  type: 'object',
                  props: {
                    id: { type: 'string' },
                    url: {
                      type: 'string',
                      label: 'Url',
                    },
                  },
                },
              },
              description: {
                type: 'string',
                optional: true,
                label: 'Description',
              },
            },
          },
        },
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
      amount: { type: 'number', positive: true, optional: true },
      expirationDate: { type: 'number', optional: true },
      includeAddOns: { type: 'boolean', optional: true },
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
            'Time',
            'DateTime',
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
        infoText: { type: 'string', optional: true },
        showOtherOption: { type: 'boolean', optional: true, default: false },
        showOtherText: { type: 'string', optional: true, default: 'Other' },
        lockResponse: { type: 'boolean', optional: true, default: false },
        answerDeadline: { type: 'number', optional: true },
      },
    },
  },
  priceIncludes: { type: 'string', optional: true },
  priceExcludes: { type: 'string', optional: true },
  isPublic: { type: 'boolean', optional: true },
  lastBookingDate: { type: 'number', optional: true },
  status: { type: 'string', optional: true },
  showAttendees: { type: 'boolean', optional: true },
  showAttendeesCount: { type: 'boolean', optional: true },
  allowExpressCheckout: { type: 'boolean', optional: true },
  isAutoPayEnabled: { type: 'boolean', optional: true },
  bookingExpiryDays: { type: 'number', optional: true },
  isRSVPEnabled: { type: 'boolean', optional: true },
  autoRegisterRSVP: { type: 'boolean', optional: true },
  isBookingEnabled: { type: 'boolean', optional: true },
  autoAcceptBookingRequest: { type: 'boolean', optional: true },
  budget: {
    type: 'object',
    optional: true,
    props: {
      currency: { type: 'string', optional: true },
      amount: { type: 'number', optional: true },
    },
  },
  allowMultipleOptions: { type: 'boolean', optional: true },
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
  addOns: {
    ...tripSchema.addOns,
    optional: true,
  },
  venues: {
    ...tripSchema.venues,
    optional: true,
  },
  itineraries: {
    ...tripSchema.itineraries,
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
  travelerNotifications: {
    type: 'array',
    optional: true,
  },
  hostNotifications: {
    type: 'array',
    optional: true,
  },
  linksView: { type: 'array', optional: true },
  userPermissionsView: { type: 'array', optional: true },
  hiddenAttendees: { type: 'object', optional: true },
  location: { type: 'string', optional: true },
};

const draftpSchema = {
  title: { type: 'string', optional: true },
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
  isDepositApplicable: {
    ...tripSchema.isDepositApplicable,
    optional: true,
  },
  minGroupSize: {
    ...tripSchema.minGroupSize,
    optional: true,
  },
  maxGroupSize: {
    ...tripSchema.maxGroupSize,
    optional: true,
  },
  location: { type: 'string', optional: true },
};

const createProjectSchema = {
  name: { type: 'string', empty: false },
  content: { type: 'array', optional: true },
  tripId: { type: 'string', optional: true },
  organizationId: { type: 'string', empty: false },
};
const editProjectSchema = {
  name: { type: 'string', empty: false },
  content: { type: 'array', optional: true },
  tripId: { type: 'string', optional: true },
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
export const createProjectValidation = new Validator().compile(
  createProjectSchema
);
export const editProjectValidation = new Validator().compile(editProjectSchema);
export const draftTripValidation = new Validator().compile(draftpSchema);
export const createTripValidation = new Validator().compile(tripSchema);
export const updateTripValidation = new Validator().compile(tripUpdateSchema);
