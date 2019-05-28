/**
 * @name - tripModel
 * @description - All the schema validation for trip handled from here
 */
import Validator from 'fastest-validator';
import * as moment from 'moment';
import uuid from 'uuid';
import { DATE_FORMAT } from '../constants/constants';

const tripBaseSchema = {
  title: { type: 'string', empty: false },
  description: { type: 'string', empty: false },
  startDate: { type: 'string', empty: false },
  endDate: { type: 'string', empty: false },
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
    enum: ['english', 'hindi', 'spanish', 'french'],
  },
  budgets: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
    enum: ['$', '$$', '$$$', '$$$$', '$$$$$'],
  },
  connections: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
  },
  pictureUrls: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
  },
  interests: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
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
  },
  isActive: {
    type: 'boolean',
    optional: true,
    empty: false,
  },
  $$strict: true,
};

const createTripSchema = {
  ...tripBaseSchema,
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

export const updateTripDefaultValues = {
  updatedAt: moment().unix(),
};

export const createTripDefaultValues = {
  isActive: true,
  isArchived: 0,
  id: uuid.v1(),
  createdAt: moment().unix(),
  ...updateTripDefaultValues,
};

export const createTripValidation = new Validator().compile(createTripSchema);
export const updateTripValidation = new Validator().compile(tripBaseSchema);
