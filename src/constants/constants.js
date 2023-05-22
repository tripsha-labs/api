/**
 * @name - constants
 * @description Application level constants defined here
 */

export const APP_CONSTANTS = {
  LIMIT: 50,
  PAGE: 0,
  SPOTSFILLED_PERCEENT: 100,
  MAX_TRIP_LENGTH: 365,
  MIN_TRIP_LENGTH: 0,
  MATCHES_ID: process.env.MAILCHIMP_AUDIENCE_LIST_ID,
};

export const DATE_FORMAT = 'YYYYMMDD';

export const USER_BASIC_INFO = {
  _id: 1,
  email: 1,
  firstName: 1,
  lastName: 1,
  username: 1,
  avatarUrl: 1,
  discord_url: 1,
  facebook_url: 1,
  instagram_url: 1,
  twitter_url: 1,
  website_url: 1,
  bio: 1,
};
