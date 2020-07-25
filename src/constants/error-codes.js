/**
 * @name - Error Keys
 * @description - All the response error codes defined here
 */

export const ERROR_KEYS = {
  ITEM_NOT_FOUND: {
    type: 'itemNotFound',
    message: 'The requested item was not found.',
    code: 404,
  },
  BAD_REQUEST: {
    type: 'badRequest',
    message:
      'Sorry! Something went wrong on our end. Please go back and try again.',
    code: 400,
  },
  INTERNAL_SERVER_ERROR: {
    type: 'internalServerError',
    message:
      'Sorry! Something went wrong on our end. Please go back and try again.',
    code: 500,
  },
  MISSING_FIELD: {
    type: 'required',
    message: "Whoops you need to enter a '{ field }' to proceed.",
    code: 400,
  },
  INVALID_DATES: {
    type: 'invalidDates',
    message:
      'Whoops! One or both of your trip dates are invalid. Trips must within the next 24 months to be valid.',
    code: 400,
  },
  TRIP_NOT_FOUND: {
    type: 'tripNotFound',
    message:
      "Hmm we can't find that trip. Please go back and try again. If you encounter this error again please contact support@tripsha.com.",
    code: 404,
  },
  USER_NOT_FOUND: {
    type: 'userNotFound',
    message: "Whoops! Looks like that person doesn't exist on Tripsha yet!",
    code: 404,
  },
  MEMBER_NOT_FOUND: {
    type: 'memberNotFound',
    message: "Whoops! Looks like that person doesn't exist on Tripsha yet!",
    code: 404,
  },
  MEMBER_ALREADY_EXISTS: {
    type: 'memberExists',
    message:
      'Whoops! Looks like that username already exists! Please select a different one and try again.',
    code: 400,
  },
  USER_ALREADY_EXISTS: {
    type: 'userExists',
    message:
      'Whoops! Looks like that username already exists! Please select a different one and try again.',
    code: 400,
  },
  NOT_GROUP_MEMBER: {
    type: 'notgroupmember',
    message: 'You are not a group member.',
    code: 400,
  },
  UNAUTHORIZED: {
    type: 'Unauthorized',
    message: 'You do not have sufficient permission to perform this operation.',
    code: 403,
  },
  TRIP_IS_FULL: {
    type: 'TripFull',
    message: `Trip already full, we will keep your request in waitlist and let you know whenever a spot avaialble. 
      You need to select your booking preferences once again while you booking again.`,
    code: 400,
  },
  TRIP_BOOKING_CLOSED: {
    type: 'TripBookingClosed',
    message: `We are closed our bookings. For more details you may contact trip host or Tripsha administrator.`,
    code: 400,
  },
  TRIP_RESOURCES_FULL: {
    type: 'TripResourcesFull',
    message: `The resources you are trying to book, already full, try changing other options.`,
    code: 400,
  },
  BOOKING_NOT_FOUND: {
    type: 'BookingNotFound',
    message: `Ooops! looks like the booking id is invalid.`,
    code: 400,
  },
  HOST_REQUEST_NOT_FOUND: {
    type: 'HostRequestNotFound',
    message: `Ooops! looks like the host request id is invalid.`,
    code: 400,
  },
  HOST_REQUEST_ALREADY_EXISTS: {
    type: 'HostRequestAlreadyExists',
    message: `Host request already exists.`,
    code: 400,
  },
  INVALID_ACTION: {
    type: 'InvalidAction',
    message: `Ooops! looks you are trying to perform invalid action.`,
    code: 400,
  },
};
