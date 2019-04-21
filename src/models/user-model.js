/**
 * @name - userModel
 * @description - All the user module releted validation handled from here
 */
import Validator from 'fastest-validator';
import * as moment from 'moment';

const userBaseSchema = {
  dob: { type: 'string', optional: true, empty: false },
  firstName: { type: 'string', empty: false, optional: true },
  lastName: { type: 'string', empty: false, optional: true },
  gender: {
    type: 'enum',
    optional: true,
    empty: false,
    values: ['male', 'female', 'other'],
  },
  phone: { type: 'number', optional: true, empty: false },
  spokenLanguages: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
    enum: ['english', 'hindi'],
  },
  homeAddress: {
    type: 'object',
    empty: false,
    optional: true,
    props: {
      country: { type: 'string', empty: false, optional: true },
      address: { type: 'string', empty: false, optional: true },
      city: { type: 'string', empty: false, optional: true },
      zip: { type: 'number', empty: false, optional: true },
    },
  },
  bio: { type: 'string', optional: true, empty: false },
  isLookingForTravel: {
    type: 'boolean',
    optional: true,
    empty: false,
    values: ['true', 'false'],
  },
  profilePic: { type: 'url', optional: true, empty: false },
  connections: {
    type: 'array',
    optional: true,
    empty: false,
    items: {
      type: 'string',
      optional: true,
      empty: false,
      props: {
        name: {
          type: 'string',
          optional: true,
          empty: false,
        },
        details: {
          type: 'string',
          optional: true,
          empty: false,
        },
      },
    },
  },
  interests: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
  },
  countryInterests: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
  },
  $$strict: true,
};

const createUserSchema = {
  username: { type: 'string', empty: false },
  email: { type: 'email', empty: false },
  firstName: { type: 'string', empty: false, optional: true },
  lastName: { type: 'string', empty: false, optional: true },
};

export const updateUserDefaultValues = {
  updateAt: moment.utc(),
};

export const createUserDefaultValues = {
  isActive: true,
  isLookingForTravel: false,
  createdAt: moment.utc(),
  ...updateUserDefaultValues,
};

export const createUserValidation = new Validator().compile(createUserSchema);
export const updateUserValidation = new Validator().compile(userBaseSchema);
