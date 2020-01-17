/**
 * @name - Trip validator
 * @description - This Trip schema validator
 */
import Validator from 'fastest-validator';
import moment from 'moment';
import { DATE_FORMAT } from '../constants/constants';

const tripSchema = {
  title: { type: 'string', empty: false },
  startDate: { type: 'number', empty: false },
  endDate: { type: 'number', empty: false },
  minGroupSize: {
    type: 'number',
    empty: false,
    positive: true,
    integer: true,
  },
  maxGroupSize: {
    type: 'number',
    empty: false,
    positive: true,
    integer: true,
  },
  description: { type: 'string', empty: false, optional: true },
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
  focus: {
    type: 'string',
    optional: true,
    empty: true,
  },
  cost: {
    type: 'number',
    optional: true,
    empty: true,
    positive: true,
  },
  intinerary: {
    type: 'array',
    items: {
      description: 'string',
      imageUrl: 'string',
    },
  },
  priceIncludes: 'string',
  priceExcludes: 'string',
  isPublic: {
    type: 'boolean',
    optional: true,
    empty: false,
    values: ['true', 'false'],
  },
  $$strict: true,
};

const tripUpdateSchema = {
  ...tripSchema,
  title: { type: 'string', empty: false, optional: true },
  startDate: { type: 'number', empty: false, optional: true },
  endDate: { type: 'number', empty: false, optional: true },
  minGroupSize: {
    type: 'number',
    empty: false,
    positive: true,
    integer: true,
    optional: true,
  },
  maxGroupSize: {
    type: 'number',
    empty: false,
    positive: true,
    integer: true,
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
