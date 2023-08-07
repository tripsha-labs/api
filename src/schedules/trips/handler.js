import moment from 'moment';
import { dbConnect } from '../../utils';

import {
  TripModel,
  MemberModel,
  ConversationModel,
  BookingModel,
  UserModel,
} from '../../models';
import { removeAddonResources, removeRoomResources } from '../../helpers';
import { sendNotifications } from '../../helpers/db-helper';

const archiveTrip = async () => {
  console.log('Archiving trips...');
  try {
    const filter = {
      endDate: {
        $lt: parseInt(
          moment()
            .subtract(7, 'days')
            .format('YYYYMMDD')
        ),
      },
      isArchived: false,
    };
    const select = {
      _id: 1,
    };
    const pagination = {
      limit: 500,
    };
    const query = { filter, select, pagination };
    let trips = await TripModel.list(query);
    trips.forEach(async trip => {
      try {
        const memberCount = await MemberModel.count({ tripId: trip._id });
        await TripModel.update(trip._id, {
          isArchived: true,
          archivedOn: parseInt(moment().format('YYYYMMDD')),
          status: memberCount > 1 ? 'completed' : 'canceled',
        });
      } catch (err) {
        console.log(err);
      }
    });
    console.log('Archived trips:', trips.length);
    if (trips.length > 0) {
      await archiveTrip();
    }
  } catch (err) {
    console.log(err);
  }
};
const archiveConversation = async (skip = 0, limit = 500) => {
  console.log('Archiving conversations...');
  try {
    const filter = {
      endDate: {
        $lt: parseInt(
          moment()
            .add(15, 'days')
            .format('YYYYMMDD')
        ),
      },
      isArchived: true,
      $or: [
        { isConversationArchived: { $exists: false } },
        { isConversationArchived: false },
      ],
    };
    const select = {
      _id: 1,
    };
    const pagination = {
      limit: 500,
      skip: limit * skip,
    };
    const query = { filter, select, pagination };
    const trips = await TripModel.list(query);
    const tripObjIds = trips.map(trip => trip._id);
    const tripIds = trips.map(trip => trip._id.toString());
    if (tripIds && tripIds.length > 0)
      await ConversationModel.updateMany(
        { tripId: { $in: tripIds }, isArchived: false },
        { isArchived: true }
      );
    await TripModel.updateMany(
      {
        _id: { $in: tripObjIds },
        $or: [
          { isConversationArchived: { $exists: false } },
          { isConversationArchived: false },
        ],
      },
      { isConversationArchived: true }
    );
    console.log('Archived conversations:', tripIds.length);
    if (tripIds.length > 0) {
      await archiveConversation(skip + 1, 500);
    }
  } catch (err) {
    console.log(err);
  }
};
const archiveBookingRequest = async () => {
  console.log('Archiving booking request, 72 hours completed...');
  try {
    const bookings = await BookingModel.list({
      filter: {
        bookingExpireOn: {
          $lt: moment().unix(),
        },
        status: 'pending',
      },
      limit: 100,
    });
    if (bookings.length > 0) {
      const promises = [];
      bookings.forEach(async booking => {
        promises.push(
          new Promise(async resolve => {
            try {
              await BookingModel.update(booking._id, {
                status: 'expired',
              });
              const tripUpdate = {};
              const trip = await TripModel.getById(booking.tripId);
              tripUpdate['rooms'] = removeRoomResources(booking, trip, [
                'reserved',
              ]);
              tripUpdate['addOns'] = removeAddonResources(booking, trip, [
                'reserved',
              ]);
              await TripModel.update(trip._id, tripUpdate);

              const member = await UserModel.getById(booking.memberId);
              const trip_url = `${
                process.env.CLIENT_BASE_URL
              }/trip/${trip._id.toString()}`;
              const tripName = `<a href="${trip_url}">${trip['title']}</a>`;
              const tripOwner = await UserModel.getById(trip.ownerId);
              const travelerName = `${member?.firstName ||
                ''} ${member?.lastName || ''}`;
              const { hostNotifications, travelerNotifications } = trip || {};
              const rsvpHost = hostNotifications?.find(
                a => a.id == 'booking_request_expired'
              );
              const rsvpTraveler = travelerNotifications?.find(
                a => a.id == 'booking_request_expired'
              );

              // Traveller notification
              if (rsvpTraveler && rsvpTraveler?.hasOwnProperty('id')) {
                const type = [];
                if (rsvpTraveler?.inapp) type.push('app');
                if (rsvpTraveler?.email) type.push('email');
                await sendNotifications(
                  'booking_request_expired_traveler',
                  member,
                  [member?._id],
                  trip._id,
                  {
                    emailParams: {
                      TripName: tripName,
                    },
                    messageParams: {
                      TripName: trip['title'],
                    },
                  },
                  type
                );
              }
              // Host notification
              if (rsvpHost && rsvpHost?.hasOwnProperty('id')) {
                const type = [];
                if (rsvpHost?.inapp) type.push('app');
                if (rsvpHost?.email) type.push('email');
                await sendNotifications(
                  'booking_request_expired_host',
                  tripOwner,
                  [tripOwner?._id],
                  trip._id,
                  {
                    emailParams: {
                      TripName: tripName,
                      TravelerName: travelerName,
                    },
                    messageParams: {
                      TravelerName: travelerName,
                      TripName: trip['title'],
                    },
                  },
                  type
                );
              }

              // // Traveller activity record
              // await logActivity({
              //   ...LogMessages.BOOKING_REQUEST_EXPIRED_TRAVELER(trip['title']),
              //   tripId: trip._id.toString(),
              //   audienceIds: [member._id.toString()],
              //   userId: tripOwner._id.toString(),
              // });
              // // Host activity record
              // await logActivity({
              //   ...LogMessages.BOOKING_REQUEST_EXPIRED_HOST(
              //     member['firstName'],
              //     trip['title']
              //   ),
              //   tripId: trip._id.toString(),
              //   audienceIds: [tripOwner._id.toString()],
              //   userId: tripOwner._id.toString(),
              // });
              // Traveller email
              // await EmailSender(
              //   member,
              //   EmailMessages.BOOKING_REQUEST_EXPIRED_TRAVELER,
              //   [trip._id.toString(), trip['title']]
              // );

              //Host email
              // await EmailSender(
              //   tripOwner,
              //   EmailMessages.BOOKING_REQUEST_EXPIRED_HOST,
              //   [trip._id.toString(), trip['title'], member['firstName']]
              // );
              return resolve();
            } catch (err) {
              console.log(err);
              return resolve();
            }
          })
        );
      });
      await Promise.all(promises);
      await archiveBookingRequest();
      console.log('Archived booking request 72 hours');
    }
  } catch (err) {
    console.log(err);
  }
};
const notify48hBookingRequest = async () => {
  console.log('Archiving booking request 48 hours remaining...');
  try {
    const bookings = await BookingModel.list({
      filter: {
        bookingExpireOn: {
          $lt: moment()
            .add(2, 'days') // 48 hours remaining send reminder
            .unix(),
        },
        status: 'pending',
        $or: [
          { is48hEmailSent: { $exists: false } },
          { is48hEmailSent: false },
        ],
      },
      select: {
        _id: 1,
        tripId: 1,
        memberId: 1,
      },
      limit: 100,
    });
    if (bookings.length > 0) {
      const promises = [];
      bookings.forEach(async booking => {
        promises.push(
          new Promise(async resolve => {
            try {
              // const trip = await TripModel.getById(booking.tripId);
              // const tripOwner = await UserModel.getById(trip.ownerId);
              //Host email
              // await EmailSender(
              //   tripOwner,
              //   EmailMessages.BOOKING_REQUEST_24_HOURS_LEFT_HOST,
              //   [trip._id.toString(), trip['title']]
              // );
              await BookingModel.update(booking._id, {
                is48hEmailSent: true,
              });
              resolve();
            } catch (err) {
              resolve();
            }
          })
        );
      });
      await Promise.all(promises);
      await notify48hBookingRequest();
      console.log('Archived booking request 48 hours remaining');
    }
  } catch (err) {
    console.log(err);
  }
};
const notify24hBookingRequest = async () => {
  console.log('Archiving booking request 24 hours remaining...');
  try {
    const bookings = await BookingModel.list({
      filter: {
        bookingExpireOn: {
          $lt: moment()
            .add(1, 'days') // 24 hours remaining send reminder
            .unix(),
        },
        status: 'pending',
        $or: [
          { is24hEmailSent: { $exists: false } },
          { is24hEmailSent: false },
        ],
      },
      select: {
        _id: 1,
        tripId: 1,
        memberId: 1,
      },
      limit: 100,
    });
    if (bookings.length > 0) {
      const promises = [];
      const { hostNotifications } = trip || {};
      const rsvpHost = hostNotifications?.find(
        a => a.id == 'booking_request_24_hours'
      );
      bookings.forEach(async booking => {
        promises.push(
          new Promise(async resolve => {
            try {
              const trip = await TripModel.getById(booking.tripId);
              const trip_url = `${
                process.env.CLIENT_BASE_URL
              }/trip/${trip._id.toString()}`;
              const tripName = `<a href="${trip_url}">${trip['title']}</a>`;
              const tripOwner = await UserModel.getById(trip.ownerId);
              if (rsvpHost && rsvpHost?.hasOwnProperty('id')) {
                const type = [];
                if (rsvpHost?.email) type.push('email');
                await sendNotifications(
                  'booking_request_24_hours_host',
                  tripOwner,
                  [tripOwner?._id],
                  trip._id,
                  {
                    emailParams: {
                      TripName: tripName,
                    },
                  },
                  type
                );
              }
              await BookingModel.update(booking._id, {
                is24hEmailSent: true,
              });
              return resolve();
            } catch (err) {
              console.log(err);
              return resolve();
            }
          })
        );
      });
      await Promise.all(promises);
      await notify24hBookingRequest();
      console.log('Archived booking request 24 hours remaining');
    }
  } catch (err) {
    console.log(err);
  }
};
export const tripsWatcher = async (event, context) => {
  try {
    await dbConnect();
    await archiveTrip();
    await archiveConversation();
    await archiveBookingRequest();
    await notify24hBookingRequest();
    await notify48hBookingRequest();
    return context.logStreamName;
  } catch (err) {
    console.log(err);
  }
};
