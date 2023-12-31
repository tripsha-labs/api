export const LogMessages = {
  CREATE_DRAFT_TRIP_HOST: trip_name => {
    return {
      message: `Trip ${trip_name} was saved as a draft.`,
      type: 'Trip',
    };
  },
  CREATE_TRIP_HOST: trip_name => {
    return { message: `You created ${trip_name}.`, type: 'Trip' };
  },
  UPDATE_TRIP_HOST: trip_name => {
    return { message: `You updated ${trip_name}.`, type: 'Trip' };
  },
  DELETE_TRIP_HOST: trip_name => {
    return { message: `Draft trip ${trip_name} was deleted.`, type: 'Trip' };
  },
  TRIP_PUBLISHED: trip_name => {
    return { message: `Trip ${trip_name} was published.`, type: 'Trip' };
  },
  BOOKING_REQUEST_TRAVELER: trip_name => {
    return {
      message: `You submitted a booking request for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_HOST: (traveler_name, trip_name) => {
    return {
      message: `${traveler_name} submitted a booking request for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_WITHDRAW_TRAVELER: trip_name => {
    return {
      message: `You withdrew your booking request for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_WITHDRAW_HOST: (traveler_name, trip_name) => {
    return {
      message: `${traveler_name} withdrew a booking request for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_EXPIRED_TRAVELER: trip_name => {
    return {
      message: `Your booking request for ${trip_name} expired.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_EXPIRED_HOST: (traveler_name, trip_name) => {
    return {
      message: `${traveler_name}'s booking request for ${trip_name} expired.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_APPROVE_TRAVELER: trip_name => {
    return {
      message: `Your booking request for ${trip_name} was accepted.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_APPROVE_HOST: (traveler_name, trip_name) => {
    return {
      message: `You accepted ${traveler_name}'s booking request for ${trip_name}. `,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_DECLINE_TRAVELER: trip_name => {
    return {
      message: `Your request to join ${trip_name} was declined.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_DECLINE_HOST: (traveler_name, trip_name) => {
    return {
      message: `You declined ${traveler_name}'s request to join ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_INITIAL_PAYMENT_SUCCESS_HOST: (traveler_name, trip_name) => {
    return {
      message: `The partial payment for ${traveler_name}'s booking on ${trip_name} was received.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_INITIAL_PAYMENT_SUCCESS_TRAVELER: trip_name => {
    return {
      message: `You made a partial payment for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_FULL_PAYMENT_SUCCESS_HOST: (traveler_name, trip_name) => {
    return {
      message: `The full payment for ${traveler_name}'s booking on ${trip_name} was received.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_FULL_PAYMENT_SUCCESS_TRAVELER: trip_name => {
    return {
      message: `You made a full payment for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_INITIAL_PAYMENT_FAILED_HOST: (traveler_name, trip_name) => {
    return {
      message: `The partial payment for ${traveler_name}'s booking on ${trip_name} failed.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_INITIAL_PAYMENT_FAILED_TRAVELER: trip_name => {
    return {
      message: `Your partial payment for ${trip_name} failed.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_FULL_PAYMENT_FAILED_HOST: (traveler_name, trip_name) => {
    return {
      message: `The full payment for ${traveler_name}'s booking on ${trip_name} failed.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_FULL_PAYMENT_FAILED_TRAVELER: trip_name => {
    return {
      message: `Your full payment for ${trip_name} failed.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_HOST: (traveler_name, trip_name) => {
    return {
      message: `${traveler_name}'s balance payment towards ${trip_name} was successful.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_TRAVELER: trip_name => {
    return {
      message: `Your balance payment towards ${trip_name} was successful.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_BALANCE_PAYMENT_FAILED_TRAVELER: trip_name => {
    return {
      message: `Your balance payment towards ${trip_name} failed.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_BALANCE_PAYMENT_FAILED_HOST: (traveler_name, trip_name) => {
    return {
      message: `A balance payment by ${traveler_name} towards ${trip_name} failed.`,
      type: 'Booking',
    };
  },
  TRAVELER_LEFT_TRIP_HOST: (traveler_name, trip_name) => {
    return {
      message: `Your traveler, ${traveler_name}, has left the ${trip_name}.`,
      type: 'Membership',
    };
  },
  TRAVELER_LEFT_TRIP_TRAVELER: trip_name => {
    return {
      message: `You have successfully left the trip ${trip_name}.`,
      type: 'Membership',
    };
  },
  HOST_MEMBER_REMOVAL_REQUEST_HOST: (traveler_name, trip_name) => {
    return {
      message: `Your request for the removal of ${traveler_name} from your trip ${trip_name} has been sent. You will be notified shortly by the Tripsha Team of the status of the request.`,
      type: 'Membership',
    };
  },
  TRAVELER_MEMBER_REMOVAL_REQUEST_APPROVED_HOST: (traveler_name, trip_name) => {
    return {
      message: `Your request to remove ${traveler_name} has been approved. This traveler is no longer attending ${trip_name}.`,
      type: 'Membership',
    };
  },
  TRAVELER_ADDED_IN_TRIP_BY_HOST: trip_name => {
    return {
      message: `You have been added to ${trip_name} by the host.`,
      type: 'Membership',
    };
  },
  HOST_LINKED_TO_STRIPE_ACCOUNT: () => {
    return {
      message: `You have successfully linked your Stripe account to Tripsha.`,
      type: 'StripeConnect',
    };
  },
};
