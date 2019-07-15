/**
 * @name - constants
 * @description Application constants defined here
 */
export const TABLE_NAMES = {
  USER: process.env.tblUsers,
  TRIP: process.env.tblTrips,
  TAGS: process.env.tblTags,
  MEMBERS: process.env.tblMembers,
  MESSAGES: process.env.tblMessages,
  CONVERSATIONS: process.env.tblConversations,
  COUNTRIES: process.env.tblCountries,
  CONNECTIONS: process.env.tblConnectionInfo,
};

export const APP_CONSTANTS = {
  TAG_LIST_LIMIT: 20,
};
export const DATE_FORMAT = 'YYYYMMDD';
