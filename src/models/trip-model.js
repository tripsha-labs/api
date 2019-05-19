/**
 * @name - tripModel
 * @description - All the schema validation for trip handled from here
 */
import Validator from 'fastest-validator';
import * as moment from 'moment';

const tripBaseSchema = {
  title: { type: 'string', empty: false },
  description: { type: 'string', optional: true, empty: false },
  startDate: { type: 'number', optional: true, empty: false },
  endDate: { type: 'number', optional: true, empty: false },
  destinations: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
  },
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
  minGroupSize: {
    type: 'number',
    optional: true,
    empty: false,
  },
  maxGroupSize: {
    type: 'number',
    optional: true,
    empty: false,
  },
  isPublic: {
    type: 'boolean',
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
  updateAt: moment().unix(),
};

export const createTripDefaultValues = {
  isActive: true,
  createdAt: moment().unix(),
  ...updateTripDefaultValues,
};

export const createTripValidation = new Validator().compile(createTripSchema);
export const updateTripValidation = new Validator().compile(tripBaseSchema);
