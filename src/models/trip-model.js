/**
 * @name - tripModel
 * @description - All the schema validation for trip handled from here
 */
import Validator from 'fastest-validator';
import * as moment from 'moment';
import { DATE_FORMAT } from '../constants/constants';

const tripBaseSchema = {
  title: { type: 'string', empty: false, optional: true },
  description: { type: 'string', empty: false, optional: true },
  startDate: { type: 'string', empty: false, optional: true },
  endDate: { type: 'string', empty: false, optional: true },
  destinations: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  languages: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  budgets: {
    type: 'array',
    optional: true,
    items: 'string',
    enum: ['$', '$$', '$$$', '$$$$', '$$$$$'],
  },
  pictureUrls: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  interests: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  connections: {
    type: 'array',
    optional: true,
    items: 'string',
  },
  focus: {
    type: 'string',
    optional: true,
    empty: true,
  },
  cost: {
    type: 'number',
    optional: true,
    empty: true,
  },
  minGroupSize: {
    type: 'number',
    empty: false,
  },
  maxGroupSize: {
    type: 'number',
    empty: false,
  },
  isPublic: {
    type: 'boolean',
    optional: true,
    empty: false,
    values: ['true', 'false'],
  },
  isActive: {
    type: 'boolean',
    optional: true,
    empty: false,
    values: ['true', 'false'],
  },
  $$strict: true,
};

const createTripSchema = {
  ...tripBaseSchema,
  title: { type: 'string', empty: false },
  startDate: { type: 'string', empty: false },
  endDate: { type: 'string', empty: false },
  minGroupSize: { type: 'number', empty: false },
  maxGroupSize: { type: 'number', empty: false },
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

export const createTripValidation = new Validator().compile(createTripSchema);
export const updateTripValidation = new Validator().compile(tripBaseSchema);
