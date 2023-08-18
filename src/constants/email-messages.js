export const EmailMessages = {
  USER_SIGNUP: {
    subject: 'Thanks for signing up for Tripsha',
    message: name => {
      return `
      ${name}
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  TRIP_PUBLISHED: {
    subject: 'Your trip has been published',
    message: (tripId, tripName) => {
      const search_trip_url = `${process.env.CLIENT_BASE_URL}/search`;
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
      Your trip <a href="${trip_url}" target="_blank">${tripName}</a> has just been published. If the trip was set to public, your trip is now visible on ${search_trip_url}.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  DRAFT_TRIP_DELETED: {
    subject: 'Your draft trip has been deleted',
    message: tripName => {
      return `
      Your draft trip ${tripName} has just been deleted.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_TRAVELER: {
    subject: 'You submitted a booking request',
    message: (bookingId, tripId, tripName) => {
      const booking_request_url = `${process.env.CLIENT_BASE_URL}/dashboard?request-trip=${bookingId}`;
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
      You just submitted a booking request for <a href="${trip_url}" target="_blank">${tripName}</a>. The trip host is reviewing your request and will respond shortly. You can view the status of your request anytime from <a href="${booking_request_url}" target="_blank">${booking_request_url}<a/>.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_HOST: {
    subject: 'You have a new booking request!',
    message: (tripId, tripName, expiredays) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
      You just received a booking request for <a href="${trip_url}" target="_blank">${tripName}</a>. You have ${expiredays} days to respond to the request or it will expire. Once you accept the booking request, the traveler will be immediately be added to your trip.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  MEMBER_REMINDER_CUSTOM_MESSAGE_HOST: {
    subject: 'Tripsha Reminder!',
    message: message => {
      return message;
    },
  },
  MEMBER_INVITE_HOST: {
    subject: 'You have been invited to join the trip!',
    message: (tripId, tripName, hostName, inviteId) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
      ${hostName} is inviting you to attend <a href="${trip_url}?inviteToken=${inviteId}" target="_blank">${tripName}</a>.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_24_HOURS_LEFT_HOST: {
    subject: 'A booking request on your trip is about to expire!',
    message: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      const active_trips_url = `${process.env.CLIENT_BASE_URL}/dashboard?page=active`;
      return `
      A booking request for <a href="${trip_url}" target="_blank">${tripName}</a> is about to expire! You can respond to all open booking requests at <a href="${active_trips_url}" target="_blank">${active_trips_url}</a>. If the request expires, the traveler will have to make a new request in order to be added to your trip.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_EXPIRED_TRAVELER: {
    subject: 'Your booking request expired',
    message: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
      Your booking request on <a href="${trip_url}" target="_blank">${tripName}</a> has expired. If you would still like to join the trip, you can speak to the trip host and resubmit a booking request.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_EXPIRED_HOST: {
    subject: 'A booking request on your trip expired',
    message: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      const log_url = `${process.env.CLIENT_BASE_URL}/dashboard?page=log`;
      return `
      A booking request on <a href="${trip_url}" target="_blank">${tripName}</a> by ${travelerName} just expired. If you would still like to have ${travelerName} join your trip, you can ask them to resubmit a booking request. You can find a link to their profile on your activity log page <a href="${log_url}" target="_blank">${log_url}</a>.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_WITHDRAWN_TRAVELER: {
    subject: 'Your booking request was withdrawn',
    message: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
      Your booking request on <a href="${trip_url}" target="_blank">${tripName}</a> has been withdrawn. If you would still like to join the trip, you can speak to the trip host and resubmit a booking request.
      <br/>
      <br/>
      As always you can message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_WITHDRAWN_HOST: {
    subject: 'A booking request on your trip has been withdrawn',
    message: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
      A booking request by ${travelerName} on <a href="${trip_url}" target="_blank">${tripName}</a> has been withdrawn by the traveler.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_DECLINED_TRAVELER: {
    subject: 'Your booking request has been declined',
    message: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
      Your booking request on <a href="${trip_url}" target="_blank">${tripName}</a> has been declined. If you would still like to join the trip, you can speak to the trip host and resubmit a booking request.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_DECLINED_HOST: {
    subject: 'You declined a booking request',
    message: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
      You have declined ${travelerName}'a booking request on <a href="${trip_url}" target="_blank">${tripName}</a>. If you would like, you can message the traveler with an explanation for your decision.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_ACCEPTED_TRAVELER: {
    subject: 'Get ready to travel!',
    message: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?confirm-trip=${tripId}`;
      const bookings_url = `${process.env.CLIENT_BASE_URL}/dashboard?page=confirmed`;
      return `
      Your booking request on <a href="${trip_url}" target="_blank">${tripName}</a> was accepted and you have been added as a trip attendee! You can manage your booking at <a href="${bookings_url}" target="_blank">${bookings_url}</a>.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  BOOKING_REQUEST_ACCEPTED_HOST: {
    subject: 'Booking accepted!',
    message: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
      You accepted a booking request on <a href="${trip_url}" target="_blank">${tripName}</a>. ${travelerName} has been added as an attendee on the trip.
      <br/>
      <br/>
      As always, please feel free to message us from your Tripsha inbox if you need any assistance.
      <br/>
    `;
    },
  },
  NEW_CHAT_MESSAGE: {
    subject: 'New Message on Tripsha',
    message: message => {
      return message;
    },
  },
};

export const messages = {
  RSVP_YES: {
    hostEmail: {
      subject: 'You have a new RSVP!',
      message: (tripId, tripName, travelerName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
        return `
      ${travelerName} just RSVP'd to <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
      },
    },
    hostMessage: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
        ${travelerName} just RSVP'd to <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
    },
    travelerEmail: {
      subject: 'You have a new RSVP!',
      message: (tripId, tripName, hostName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
        return `
          ${hostName} just RSVP'd to <a href="${trip_url}" target="_blank">${tripName}</a>.
        `;
      },
    },
    travelerMessage: (tripId, tripName, hostName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
        ${hostName} just RSVP'd to <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
    },
  },
  BOOKING_REQUEST: {
    hostEmail: {
      subject: 'You have a new booking request!',
      message: (tripId, tripName, travelerName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
        return `
        ${travelerName} just submitted a booking request for <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
      },
    },
    hostMessage: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
        ${travelerName} just submitted a booking request for <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
    },
    travelerEmail: {
      subject: 'You submitted a booking request',
      message: (tripId, tripName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
        return `
        You just submitted a booking request for <a href="${trip_url}" target="_blank">${tripName}</a>. The trip host is reviewing your request and will respond shortly. You can view the status of your request anytime from your dashboard.
      `;
      },
    },
    travelerMessage: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
        You just submitted a booking request for <a href="${trip_url}" target="_blank">${tripName}</a>. The trip host is reviewing your request and will respond shortly. You can view the status of your request anytime from your dashboard.
      `;
    },
  },
  BOOKING_REQUEST_24_HOURS_LEFT: {
    hostEmail: {
      subject: 'A booking request on your trip is about to expire!',
      message: (tripId, tripName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
        const active_trips_url = `${process.env.CLIENT_BASE_URL}/dashboard?page=active`;
        return `
        A booking request for <a href="${trip_url}" target="_blank">${tripName}</a> is about to expire! You can respond to all open booking requests at <a href="${active_trips_url}" target="_blank">${active_trips_url}</a>. If the request expires, the traveler will have to make a new request in order to be added to your trip.
      `;
      },
    },
  },
  BOOKING_REQUEST_EXPIRED: {
    hostEmail: {
      subject: 'A booking request on your trip expired',
      message: (tripId, tripName, travelerName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
        const log_url = `${process.env.CLIENT_BASE_URL}/dashboard?page=log`;
        return `
        A booking request on <a href="${trip_url}" target="_blank">${tripName}</a> by ${travelerName} just expired. If you would still like to have ${travelerName} join your trip, you can ask them to resubmit a booking request. You can find a link to their profile on your activity log page <a href="${log_url}" target="_blank">${log_url}</a>.
      `;
      },
    },
    hostMessage: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      const log_url = `${process.env.CLIENT_BASE_URL}/dashboard?page=log`;
      return `
        A booking request on <a href="${trip_url}" target="_blank">${tripName}</a> by ${travelerName} just expired. If you would still like to have ${travelerName} join your trip, you can ask them to resubmit a booking request. You can find a link to their profile on your activity log page <a href="${log_url}" target="_blank">${log_url}</a>.
      `;
    },
    travelerEmail: {
      subject: 'Your booking request expired',
      message: (tripId, tripName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
        return `
        Your booking request on <a href="${trip_url}" target="_blank">${tripName}</a> has expired. If you would still like to join the trip, you can speak to the trip host and resubmit a booking request.
      `;
      },
    },
    travelerMessage: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
        Your booking request on <a href="${trip_url}" target="_blank">${tripName}</a> has expired. If you would still like to join the trip, you can speak to the trip host and resubmit a booking request.
      `;
    },
  },
  BOOKING_REQUEST_WITHDRAWN: {
    hostEmail: {
      subject: 'A booking request on your trip has been withdrawn',
      message: (tripId, tripName, travelerName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
        return `
        A booking request by ${travelerName} on <a href="${trip_url}" target="_blank">${tripName}</a> has been withdrawn by the traveler.
      `;
      },
    },
    hostMessage: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
        A booking request by ${travelerName} on <a href="${trip_url}" target="_blank">${tripName}</a> has been withdrawn by the traveler.
      `;
    },
    travelerEmail: {
      subject: 'Your booking request was withdrawn',
      message: (tripId, tripName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
        return `
        Your booking request on <a href="${trip_url}" target="_blank">${tripName}</a> has been withdrawn. If you would still like to join the trip, you can speak to the trip host and resubmit a booking request.
      `;
      },
    },
    travelerMessage: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
        Your booking request on <a href="${trip_url}" target="_blank">${tripName}</a> has been withdrawn. If you would still like to join the trip, you can speak to the trip host and resubmit a booking request.
      `;
    },
  },
  REGISTERED: {
    travelerEmail: {
      subject: 'You are registerd for the trip!',
      message: (tripId, tripName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
        return `
        You are registered for the trip <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
      },
    },
    travelerMessage: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
        You are registered for the trip <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
    },
  },
  QUESTIONAIRE_ANSWERED_RECIEVED: {
    hostEmail: {
      subject: 'You have a new questionaire answer!',
      message: (tripId, tripName, travelerName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
        return `
        ${travelerName} just answered the questionaire for <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
      },
    },
    hostMessage: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
        ${travelerName} just answered the questionaire for <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
    },
  },
  TRIP_CANCELED_BY_HOST: {
    travelerEmail: {
      subject: 'The trip has been canceled',
      message: (tripId, tripName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
        return `
        The trip <a href="${trip_url}" target="_blank">${tripName}</a> has been canceled by the host.
      `;
      },
    },
    travelerMessage: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
        The trip <a href="${trip_url}" target="_blank">${tripName}</a> has been canceled by the host.
      `;
    },
  },
  PAYMENT_CHARGE_SUCCESS: {
    travelerEmail: {
      subject: 'Your payment was successful',
      message: (tripId, tripName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
        return `
        Your payment for <a href="${trip_url}" target="_blank">${tripName}</a> was successful.
      `;
      },
    },
    travelerMessage: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
        Your payment for <a href="${trip_url}" target="_blank">${tripName}</a> was successful.
      `;
    },
    hostEmail: {
      subject: 'You have a new payment!',
      message: (tripId, tripName, travelerName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
        return `
        ${travelerName} just paid for <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
      },
    },
    hostMessage: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
        ${travelerName} just paid for <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
    },
  },
  PAYMENT_CHARGE_FAILED: {
    travelerEmail: {
      subject: 'Your payment failed',
      message: (tripId, tripName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
        return `
        Your payment for <a href="${trip_url}" target="_blank">${tripName}</a> failed.
      `;
      },
    },
    travelerMessage: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
        Your payment for <a href="${trip_url}" target="_blank">${tripName}</a> failed.
      `;
    },
  },
  TRIP_CANCELLED_BY_TRAVELER: {
    hostEmail: {
      subject: 'The trip has been canceled',
      message: (tripId, tripName, travelerName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
        return `
        ${travelerName} has canceled <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
      },
    },
    hostMessage: (tripId, tripName, travelerName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/dashboard?trip=${tripId}`;
      return `
        ${travelerName} has canceled <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
    },
    travelerEmail: {
      subject: 'You canceled the trip',
      message: (tripId, tripName) => {
        const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
        return `
        You canceled <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
      },
    },
    travelerMessage: (tripId, tripName) => {
      const trip_url = `${process.env.CLIENT_BASE_URL}/trip/${tripId}`;
      return `
        You canceled <a href="${trip_url}" target="_blank">${tripName}</a>.
      `;
    },
  },
};
