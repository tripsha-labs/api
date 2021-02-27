export const LogMessages = {
  CREATE_DRAFT_TRIP_HOST: trip_name => {
    return { message: `Trip ${trip_name} saved as draft.`, type: 'Trip' };
  },
  CREATE_TRIP_HOST: trip_name => {
    return { message: `You created ${trip_name}.`, type: 'Trip' };
  },
  UPDATE_TRIP_HOST: trip_name => {
    return { message: `You updated ${trip_name}.`, type: 'Trip' };
  },
  DELETE_TRIP_HOST: trip_name => {
    return { message: `You deleted ${trip_name}.`, type: 'Trip' };
  },
  TRIP_PUBLISHED: trip_name => {
    return { message: `Trip ${trip_name} published.`, type: 'Trip' };
  },
  BOOKING_REQUEST_TRAVELLER: trip_name => {
    return {
      message: `You submitted a booking request for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_WITHDRAW_TRAVELLER: trip_name => {
    return {
      message: `You withdrew your booking request for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_WITHDRAW_HOST: (traveller_name, trip_name) => {
    return {
      message: `${traveller_name} withdrew a booking request for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_APPROVE_TRAVELLER: trip_name => {
    return {
      message: `Your booking request for ${trip_name} was accepted.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_APPROVE_HOST: (traveller_name, trip_name) => {
    return {
      message: `You accepted ${traveller_name}'s booking request for ${trip_name}. `,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_DECLINE_TRAVELLER: trip_name => {
    return {
      message: `Your request to join ${trip_name} was declined.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_DECLINE_HOST: (traveller_name, trip_name) => {
    return {
      message: `You declined ${traveller_name}'s request to join ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_INITIAL_PAYMENT_SUCCESS_HOST: (traveller_name, trip_name) => {
    return {
      message: `Partial payment for ${traveller_name} booking on ${trip_name} received.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_INITIAL_PAYMENT_SUCCESS_TRAVELLER: trip_name => {
    return {
      message: `You made partial payment for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_FULL_PAYMENT_SUCCESS_HOST: (traveller_name, trip_name) => {
    return {
      message: `Full payment for ${traveller_name} booking on ${trip_name} received.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_FULL_PAYMENT_SUCCESS_TRAVELLER: trip_name => {
    return {
      message: `You made full payment for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_INITIAL_PAYMENT_FAILED_HOST: (traveller_name, trip_name) => {
    return {
      message: `Partial payment for ${traveller_name} booking on ${trip_name} received.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_INITIAL_PAYMENT_FAILED_TRAVELLER: trip_name => {
    return {
      message: `You made partial payment for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_FULL_PAYMENT_FAILED_HOST: (traveller_name, trip_name) => {
    return {
      message: `Full payment for ${traveller_name} booking on ${trip_name} received.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_FULL_PAYMENT_FAILED_TRAVELLER: trip_name => {
    return {
      message: `You made full payment for ${trip_name}.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_HOST: (traveller_name, trip_name) => {
    return {
      message: `${traveller_name} balance payment towards ${trip_name} was successful.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_TRAVELLER: trip_name => {
    return {
      message: `Your balance payment towards ${trip_name} was successful.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_BALANCE_PAYMENT_FAILED_TRAVELLER: trip_name => {
    return {
      message: `Your balance payment towards ${trip_name} was unsuccessful.`,
      type: 'Booking',
    };
  },
  BOOKING_REQUEST_BALANCE_PAYMENT_FAILED_HOST: (traveller_name, trip_name) => {
    return {
      message: `A balance payment by ${traveller_name} towards ${trip_name} was unsuccessful.`,
      type: 'Booking',
    };
  },
  TRAVELLER_LEFT_TRIP_HOST: (traveller_name, trip_name) => {
    return {
      message: `Your traveler ${traveller_name} has left the ${trip_name}.`,
      type: 'Membership',
    };
  },
  TRAVELLER_LEFT_TRIP_TRAVELLER: trip_name => {
    return {
      message: `You have successfully left the trip ${trip_name}.`,
      type: 'Membership',
    };
  },
  HOST_MEMBER_REMOVAL_REQUEST_HOST: (traveller_name, trip_name) => {
    return {
      message: `Your request for the removal of ${traveller_name} from your trip ${trip_name} has been sent. You will be notified shortly by the Tripsha Team the status of the request.`,
      type: 'Membership',
    };
  },
  TRAVELLER_MEMBER_REMOVAL_REQUEST_APPROVED_HOST: (
    traveller_name,
    trip_name
  ) => {
    return {
      message: `Your request for the removal ${traveller_name} traveler has been approved. This traveler is no longer attending ${trip_name}.`,
      type: 'Membership',
    };
  },
  TRAVELLER_MEMBER_REMOVAL_REQUEST_APPROVED_HOST: (
    traveller_name,
    trip_name
  ) => {
    return {
      message: `Your request for the removal ${traveller_name} traveler has been approved. This traveler is no longer attending ${trip_name}.`,
      type: 'Membership',
    };
  },
  TRAVELLER_ADDED_IN_TRIP_BY_HOST: trip_name => {
    return {
      message: `You have been added to  ${trip_name} by the host.`,
      type: 'Membership',
    };
  },
  HOST_LINKED_TO_STRIPE_ACCOUNT: () => {
    return {
      message: `You have successfully been linked to a Stripe account with Tripsha.`,
      type: 'StripeConnect',
    };
  },
};
