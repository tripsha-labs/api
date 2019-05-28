/**
 * @name - errorCodes
 * @description - All the response error codes defined here
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 400,
  RESOURCE_NOT_FOUND: 404,
};
export const ERROR_KEYS = {
  ITEM_NOT_FOUND: { type: 'itemNotFound', message: 'Requested item not found' },
  BAD_REQUEST: { type: 'badRequest', message: 'Bad Request' },
  INVALID_DATES: {
    type: 'invalidDates',
    message: 'startDate and/or endDate invalid',
  },
};
