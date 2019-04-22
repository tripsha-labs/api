/**
 * @name - tripModel
 * @description - All the schema validation for trip handled from here
 */
import Validator from 'fastest-validator';
import * as moment from 'moment';
import uuid from 'uuid';

const tripBaseSchema = {
  title: { type: 'string', empty: false },
  description: { type: 'string', optional: true, empty: false },
  startDate: { type: 'date', optional: true, empty: false },
  endDate: { type: 'date', optional: true, empty: false },
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
  destinations: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'object',
    props: {
      startDate: { type: 'date', optional: true, empty: false },
      endDate: { type: 'date', optional: true, empty: false },
      country: { type: 'string', optional: true, empty: false },
      address: { type: 'string', optional: true, empty: false },
      name: { type: 'string', optional: true, empty: false },
      description: { type: 'string', optional: true, empty: false },
      mapLocation: { type: 'string', optional: true, empty: false },
      pictures: {
        type: 'array',
        optional: true,
        empty: false,
        items: {
          type: 'object',
          props: {
            url: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
          },
        },
      },
    },
  },
  members: {
    type: 'array',
    optional: true,
    empty: false,
    items: {
      type: 'object',
      props: {
        memberId: { type: 'string', optional: true },
        favorite: { type: 'boolean', optional: true },
        interestType: {
          type: 'enum',
          optional: true,
          enum: ['confirmed', 'unconfirmed'],
        },
      },
    },
  },
  members: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
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
  id: uuid.v1(),
  createdAt: moment.utc().format(),
  ...updateTripDefaultValues,
};

export const createTripValidation = new Validator().compile(createTripSchema);
export const updateTripValidation = new Validator().compile(tripBaseSchema);
