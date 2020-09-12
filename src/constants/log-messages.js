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
};
