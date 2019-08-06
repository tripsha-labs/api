/**
 * @name - userModel
 * @description - All the user module releted validation handled from here
 */
import Validator from 'fastest-validator';
import moment from 'moment';

const userBaseSchema = {
  dob: { type: 'string', optional: true },
  firstName: { type: 'string', empty: false, optional: true },
  lastName: { type: 'string', empty: false, optional: true },
  userId: { type: 'string', empty: false, optional: true },
  gender: {
    type: 'string',
    optional: true,
    empty: true,
  },
  spokenLanguages: {
    type: 'string',
    optional: true,
    empty: true,
    max: 30,
  },
  livesIn: {
    type: 'string',
    optional: true,
    empty: true,
    max: 30,
  },
  bio: { type: 'string', optional: true, max: 300 },
  isLookingForTravel: {
    type: 'boolean',
    optional: true,
    empty: true,
    values: ['true', 'false'],
  },
  avatarUrl: { type: 'string', empty: true, optional: true },
  connections: {
    type: 'array',
    optional: true,
    empty: true,
    items: {
      type: 'string',
      optional: true,
      empty: false,
    },
  },
  username: {
    type: 'string',
    optional: true,
    empty: true,
  },
  interests: {
    type: 'array',
    optional: true,
    empty: true,
    items: 'string',
  },
  bucketList: {
    type: 'string',
    optional: true,
    empty: true,
    max: 100,
  },
  isActive: { type: 'boolean', optional: true, empty: false },
  $$strict: true,
};

const createUserSchema = {
  email: { type: 'email', empty: false },
  firstName: { type: 'string', empty: false, optional: true },
  lastName: { type: 'string', empty: false, optional: true },
  $$strict: true,
};

export const updateUserDefaultValues = {
  updateAt: moment().unix(),
};

export const createUserDefaultValues = {
  isActive: 1,
  isLookingForTravel: false,
  createdAt: moment().unix(),
  ...updateUserDefaultValues,
};

export const createUserValidation = new Validator().compile(createUserSchema);
export const updateUserValidation = new Validator().compile(userBaseSchema);
