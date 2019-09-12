/**
 * @name - User validator
 * @description - This is user schema validator
 */
import Validator from 'fastest-validator';

const updateUserSchema = {
  firstName: { type: 'string', empty: false, optional: true },
  lastName: { type: 'string', empty: false, optional: true },
  dob: { type: 'string', optional: true },
  phone: {
    type: 'string',
    optional: true,
    empty: true,
  },
  identity: {
    type: 'object',
    optional: true,
    empty: true,
  },
  gender: {
    type: 'string',
    optional: true,
    empty: true,
  },
  spokenLanguages: {
    type: 'array',
    optional: true,
    empty: true,
    items: 'string',
  },
  livesIn: {
    type: 'string',
    optional: true,
    empty: true,
    max: 100,
  },
  bio: { type: 'string', optional: true },
  isLookingForTravel: {
    type: 'boolean',
    optional: true,
    empty: true,
    values: ['true', 'false'],
  },
  avatarUrl: { type: 'string', empty: true, optional: true },
  username: {
    type: 'string',
    optional: true,
    empty: true,
  },
  awsUsername: {
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
  $$strict: true,
};

const createUserSchema = {
  email: { type: 'email', empty: false },
  dob: { type: 'number', empty: false, optional: true },
  firstName: { type: 'string', empty: false },
  lastName: { type: 'string', empty: false, optional: true },
  $$strict: true,
};

export const createUserValidation = new Validator().compile(createUserSchema);
export const updateUserValidation = new Validator().compile(updateUserSchema);
