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
  favoriteSnaps: {
    type: 'array',
    optional: true,
    empty: false,
    items: {
      type: 'object',
      props: {
        description: { type: 'string', optional: true, empty: false },
        location: { type: 'string', optional: true, empty: false },
        title: { type: 'string', optional: true, empty: false },
        url: { type: 'string', optional: true, empty: false },
      },
    },
  },
  isIdentityVerified: { type: 'boolean', optional: true, empty: false },
  identities: {
    type: 'array',
    optional: true,
    empty: false,
    items: {
      type: 'object',
      props: {
        isPrimary: { type: 'boolean', optional: true, empty: false },
        mediaType: { type: 'string', optional: true, empty: false },
        idVerified: { type: 'boolean', optional: true, empty: false },
        type: { type: 'string', optional: true, empty: false },
        mediaPath: { type: 'string', optional: true, empty: false },
      },
    },
  },
  planDetails: {
    type: 'object',
    props: {
      couponDetails: { type: 'string', optional: true, empty: false },
      discount: { type: 'number', optional: true, empty: false },
      type: { type: 'string', optional: true, empty: false },
      priceUnit: { type: 'string', optional: true, empty: false },
      couponType: { type: 'string', optional: true, empty: false },
      price: { type: 'number', optional: true, empty: false },
      couponCode: { type: 'string', optional: true, empty: false },
      expireOn: { type: 'string', optional: true, empty: false },
      name: { type: 'string', optional: true, empty: false },
      paidAmount: { type: 'number', optional: true, empty: false },
      purchaseDate: { type: 'date', optional: true, empty: false },
      status: {
        type: 'enum',
        optional: true,
        empty: false,
        enum: ['new', 'renew', 'expired', 'trial'],
      },
    },
  },
  billingAddress: {
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
  billingDetails: {
    type: 'array',
    optional: true,
    empty: false,
    items: {
      type: 'object',
      props: {
        expiry: { type: 'string', optional: true, empty: false },
        cvv: { type: 'string', optional: true, empty: false },
        cardNumber: { type: 'string', optional: true, empty: false },
        isPrimary: { type: 'boolean', optional: true, empty: false },
        type: {
          type: 'enum',
          optional: true,
          empty: false,
          enum: ['master', 'visa'],
        },
        cardType: {
          type: 'enum',
          optional: true,
          empty: false,
          enum: ['credit', 'debit'],
        },
        nameOnCard: { type: 'string', optional: true, empty: false },
      },
    },
  },
  countryInterests: {
    type: 'array',
    optional: true,
    empty: false,
    items: 'string',
  },
  isActive: { type: 'boolean', optional: true, empty: false },
  $$strict: true,
};

const createUserSchema = {
  username: { type: 'string', empty: false },
  email: { type: 'email', empty: false },
  firstName: { type: 'string', empty: false, optional: true },
  lastName: { type: 'string', empty: false, optional: true },
};

export const updateUserDefaultValues = {
  updateAt: moment.utc().format(),
};

export const createUserDefaultValues = {
  isActive: true,
  isLookingForTravel: false,
  createdAt: moment.utc().format(),
  ...updateUserDefaultValues,
};

export const createUserValidation = new Validator().compile(createUserSchema);
export const updateUserValidation = new Validator().compile(userBaseSchema);
