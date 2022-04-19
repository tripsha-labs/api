/**
 * @name - User validator
 * @description - The user schema validator.
 */
import Validator from 'fastest-validator';

const updateUserSchema = {
  firstName: { type: 'string', empty: false, optional: true },
  lastName: { type: 'string', empty: true, optional: true },
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
  hideFields: {
    type: 'array',
    optional: true,
    empty: true,
    items: 'string',
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
  facebook_url: {
    type: 'string',
    optional: true,
  },
  instagram_url: {
    type: 'string',
    optional: true,
  },
  twitter_url: {
    type: 'string',
    optional: true,
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
  travelStyle: {
    type: 'string',
    optional: true,
    empty: true,
  },
  travelWithHostReason: {
    type: 'string',
    optional: true,
    empty: true,
  },
  itemsTravelWith: {
    type: 'string',
    optional: true,
    empty: true,
  },
  isTripAgreed: {
    type: 'boolean',
    optional: true,
    empty: false,
  },
  showDashboardTutorial: {
    type: 'boolean',
    optional: true,
    empty: true,
  },
  hasFirstBooking: {
    type: 'boolean',
    optional: true,
    empty: true,
  },
  isHostFirstLogin: {
    type: 'boolean',
    optional: true,
    empty: true,
  },
  additionalEmails: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      optional: true,
      props: {
        id: { type: 'string' },
        email: { type: 'string', optional: false },
        isPrimary: { type: 'string', optional: true, default: false },
      },
    },
  },
  $$strict: true,
};

const createUserSchema = {
  email: { type: 'email', empty: false },
  dob: { type: 'string', empty: false, optional: true },
  firstName: { type: 'string', empty: false, optional: true },
  lastName: { type: 'string', empty: true, optional: true },
  avatarUrl: { type: 'string', empty: true, optional: true },
  username: { type: 'string', empty: false, optional: true },
  $$strict: true,
};

const adminUpdateUserSchema = {
  isBlocked: {
    type: 'boolean',
    optional: true,
  },
  isHost: {
    type: 'boolean',
    optional: true,
  },
  firstName: {
    type: 'string',
    optional: true,
  },
  lastName: {
    type: 'string',
    optional: true,
    empty: true,
  },
  isAdmin: {
    type: 'boolean',
    optional: true,
  },
  isActive: {
    type: 'boolean',
    optional: true,
  },
  username: {
    type: 'string',
    optional: true,
  },
  hostShare: {
    type: 'number',
    optional: true,
  },
  password: {
    type: 'string',
    optional: true,
  },
  additionalEmails: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      optional: true,
      props: {
        id: { type: 'string' },
        email: { type: 'string', optional: false },
        isPrimary: { type: 'string', optional: true, default: false },
      },
    },
  },
  $$strict: true,
};
export const createUserValidation = new Validator().compile(createUserSchema);
export const updateUserValidation = new Validator().compile(updateUserSchema);
export const adminUpdateUserValidation = new Validator().compile(
  adminUpdateUserSchema
);
