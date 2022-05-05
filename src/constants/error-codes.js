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
    message: "Whoops! You need to enter a '{ field }' to proceed.",
    code: 400,
  },
  INVALID_DATES: {
    type: 'invalidDates',
    message:
      'Whoops! One or both of your trip dates are invalid. Trips must be within the next 24 months to be valid.',
    code: 400,
  },
  INVALID_ETERNAL_COUNT: {
    type: 'invalidExternalCount',
    message:
      'Whoops! The number of spots filled cannot be greater than the max group size.',
    code: 400,
  },
  TRIP_NOT_FOUND: {
    type: 'tripNotFound',
    message:
      "Hmm we can't find that trip. Please go back and try again. If you encounter this error again, please contact support@tripsha.com.",
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
      'Whoops! Looks like that member already exists! Please select a different one and try again.',
    code: 400,
  },
  USER_ALREADY_EXISTS: {
    type: 'userExists',
    message:
      'Whoops! Looks like that username already exists! Please select a different one and try again.',
    code: 400,
  },
  COUPON_CODE_ALREADY_EXISTS: {
    type: 'COUPON_CODE_ALREADY_EXISTS',
    message:
      'Whoops! Looks like that coupon code already exists! Please try a different one and try again.',
    code: 400,
  },
  NOT_GROUP_MEMBER: {
    type: 'notgroupmember',
    message: 'You are not a group member.',
    code: 400,
  },
  UNAUTHORIZED: {
    type: 'Unauthorized',
    message: 'You do not have permission to perform this operation.',
    code: 403,
  },
  BOOKING_ALREADY_EXISTS: {
    type: 'BOOKING_ALREADY_EXISTS',
    message:
      'You have already booked this trip. You can find your booking details on your dashboard.',
    code: 403,
  },
  TRIP_IS_FULL: {
    type: 'TripFull',
    message: `The trip is already full. We will keep your request on the waitlist and let you know if a spot becomes available. In the meantime, check out some of our other trips!`,
    code: 400,
  },
  TRIP_IS_FULL_HOST: {
    type: 'TripFullHost',
    message: `The trip is already full. You can either increase the number of maximum available spots and the max group size on the edit trip page, or try the force add option to increase the max group size by one automatically.`,
    code: 400,
  },
  TRIP_BOOKING_CLOSED: {
    type: 'TripBookingClosed',
    message: `This trip is closed for bookings. If you think this is in error, please message the trip host or the Tripsha Team.`,
    code: 400,
  },
  TRIP_BOOKING_WITH_DEPOSIT_DATE_PASSED: {
    type: 'TripBookingWithDepositClosed',
    message: `This trip not accpet booking deposit. Try with full payment mode`,
    code: 400,
  },
  TRIP_RESOURCES_FULL: {
    type: 'TripResourcesFull',
    message: `The resources you are trying to book are already full. Try changing other options.`,
    code: 400,
  },
  BOOKING_NOT_FOUND: {
    type: 'BookingNotFound',
    message: `Oops! Looks like the booking id is invalid.`,
    code: 400,
  },
  HOST_REQUEST_NOT_FOUND: {
    type: 'HostRequestNotFound',
    message: `Oops! Looks like the host request id is invalid.`,
    code: 400,
  },
  APPROVAL_NOT_FOUND: {
    type: 'ApprovalNotFound',
    message: `Oops! Looks like the approval id is invalid.`,
    code: 400,
  },
  HOST_REQUEST_ALREADY_EXISTS: {
    type: 'HostRequestAlreadyExists',
    message: `The host request already exists.`,
    code: 400,
  },
  INVALID_ACTION: {
    type: 'InvalidAction',
    message: `Oops! Looks like you are trying to perform an invalid action.`,
    code: 400,
  },
  CANNOT_DELETE_TRIP: {
    type: 'CANNOT_DELETE_TRIP',
    message: `Oops! Looks like there are existing bookings or members associated with this trip. Please cancel those first and try again!`,
    code: 400,
  },
  PAYMENT_FAILED: {
    type: 'PAYMENT_FAILED',
    message:
      'Oops, the payment method you provided did not go through. This request will remain active for another 72 hours. Please try an alternative payment method.',
    code: 400,
  },
  USER_INVITE_FAILED: {
    type: 'USER_INVITE_FAILED',
    message: 'Failed to invite user.',
    code: 400,
  },
  USER_ADD_FAILED: {
    type: 'USER_ADD_FAILED',
    message: 'Unable to add new user.',
    code: 400,
  },
  USERNAME_ALREADY_EXISTS: {
    type: 'USERNAME_ALREADY_EXISTS',
    message: 'The username already exists.',
    code: 400,
  },
  INVALID_COUPON_CODE: {
    type: 'INVALID_COUPON_CODE',
    message: 'The discount code might be invalid or is expired.',
    code: 400,
  },
  CARD_DELETE_FAILED: {
    type: 'CARD_DELETE_FAILED',
    message: `The selected payment method can't be deleted because its in use in one of your booking request. Please wait until the booking request get processed or cancel the booking request before performing this operation.`,
    code: 400,
  },
};
