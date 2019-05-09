/**
 * @name - tripModel
 * @description - All the schema validation for trip handled from here
 */
import Validator from 'fastest-validator';
import * as moment from 'moment';

const tripBaseSchema = {
  title: { type: 'string', empty: false },
  description: { type: 'string', optional: true, empty: false },
  startDate: { type: 'string', optional: true, empty: false },
  endDate: { type: 'string', optional: true, empty: false },
  languages: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
    enum: ['english'],
  },
  budgets: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
    enum: ['$', '$$', '$$$', '$$$$', '$$$$$'],
  },
  interests: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
  },
  groupSize: {
    type: 'number',
    optional: true,
    empty: false,
  },
  isActive: {
    type: 'boolean',
    optional: true,
    empty: false,
  },
  isArchived: {
    type: 'boolean',
    optional: true,
    empty: false,
  },
  $$strict: true,
};

const createTripSchema = {
  ...tripBaseSchema,
};

export const updateTripDefaultValues = {
  updateAt: moment.utc().format(),
};

export const createTripDefaultValues = {
  isActive: true,
  createdAt: moment.utc().format(),
  ...updateTripDefaultValues,
};

export const createTripValidation = new Validator().compile(createTripSchema);
export const updateTripValidation = new Validator().compile(tripBaseSchema);
