/**
 * @name - constants
 * @description Application constants defined here
 */
export const TABLE_NAMES = {
  USER: process.env.tblUsers || 'test-users',
  TRIP: process.env.tblTrips || 'test-trips',
  TAGS: process.env.tblTags || 'test-tags',
  MEMBERS: process.env.tblMembers || 'test-members',
  MESSAGES: process.env.tblMessages || 'test-messages',
  CONVERSATIONS: process.env.tblConversations || 'test-conversations',
  COUNTRIES: process.env.tblCountries || 'test-countries',
  CONNECTIONS: process.env.tblConnectionInfo || 'test-connections',
};

export const APP_CONSTANTS = {
  TAG_LIST_LIMIT: 20,
};
export const DATE_FORMAT = 'YYYYMMDD';
