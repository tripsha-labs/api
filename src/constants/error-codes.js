/**
 * @name - Error Keys
 * @description - All the response error codes defined here
 */

export const ERROR_KEYS = {
  ITEM_NOT_FOUND: {
    type: 'itemNotFound',
    message: 'Requested item not found',
    code: 404,
  },
  BAD_REQUEST: { type: 'badRequest', message: 'Bad Request', code: 400 },
  INTERNAL_SERVER_ERROR: {
    type: 'internalServerError',
    message: 'Oops! something went wrong, please try after sometimes',
    code: 500,
  },
  MISSING_FIELD: {
    type: 'required',
    message: "The '{ field }' field is required!",
    code: 400,
  },
  INVALID_DATES: {
    type: 'invalidDates',
    message: 'startDate and/or endDate invalid',
    code: 400,
  },
  TRIP_NOT_FOUND: {
    type: 'tripNotFound',
    message: 'Trip not found!',
    code: 404,
  },
  USER_NOT_FOUND: {
    type: 'userNotFound',
    message: 'User not found!',
    code: 404,
  },
  MEMBER_NOT_FOUND: {
    type: 'memberNotFound',
    message: 'Member not found!',
    code: 404,
  },
  MEMBER_ALREADY_EXISTS: {
    type: 'memberExists',
    message: 'Member already exists!',
    code: 400,
  },
  USER_ALREADY_EXISTS: {
    type: 'userExists',
    message: 'User already exists!',
    code: 400,
  },
};
