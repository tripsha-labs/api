import moment from 'moment';
import { dbConnect, sendEmail, logActivity } from '../../utils';
import { EmailMessages, LogMessages } from '../../constants';
import {
  TripModel,
  MemberModel,
  ConversationModel,
  BookingModel,
  UserModel,
} from '../../models';
import { removeAddonResources, removeRoomResources } from '../../helpers';

const archiveTrip = async () => {
  console.log('Archiving trips...');
  try {
    const filter = {
      endDate: { $lt: parseInt(moment().format('YYYYMMDD')) },
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
          status: memberCount > 1 ? 'completed' : 'cancelled',
        });
      } catch (err) {
        console.log(err);
      }
    });
    console.log('Acrhived trips:', trips.length);
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
    console.log('Acrhived conversations:', tripIds.length);
    if (tripIds.length > 0) {
      await archiveConversation(skip + 1, 500);
    }
  } catch (err) {
    console.log(err);
  }
};
const archiveBookingRequest = async () => {
  console.log('Archiving booking request 72 hours remaining...');
  try {
    const bookings = await BookingModel.list({
      filter: {
        createdAt: {
          $lt: moment()
            .subtract(3, 'days') // 72 hours passed then expire
            .utc(),
        },
        status: 'pending',
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
              const tripOwner = await UserModel.getById(trip.ownerId);
              // Traveller activity record
              await logActivity({
                ...LogMessages.BOOKING_REQUEST_EXPIRED_TRAVELLER(trip['title']),
                tripId: trip._id.toString(),
                audienceIds: [member._id.toString()],
                userId: tripOwner._id.toString(),
              });
              // Host activity record
              await logActivity({
                ...LogMessages.BOOKING_REQUEST_EXPIRED_HOST(
                  member['firstName'],
                  trip['title']
                ),
                tripId: trip._id.toString(),
                audienceIds: [tripOwner._id.toString()],
                userId: tripOwner._id.toString(),
              });
              // Traveller email
              await sendEmail({
                emails: [member['email']],
                name: member['firstName'],
                subject:
                  EmailMessages.BOOKING_REQUEST_EXPIRED_TRAVELLER.subject,
                message: EmailMessages.BOOKING_REQUEST_EXPIRED_TRAVELLER.message(
                  trip._id.toString(),
                  trip['title']
                ),
              });
              //Host email
              await sendEmail({
                emails: [tripOwner['email']],
                name: tripOwner['firstName'],
                subject: EmailMessages.BOOKING_REQUEST_EXPIRED_HOST.subject,
                message: EmailMessages.BOOKING_REQUEST_EXPIRED_HOST.message(
                  trip._id.toString(),
                  trip['title'],
                  member['firstName']
                ),
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
        createdAt: {
          $lt: moment()
            .subtract(2, 'days') // 48 hours remaining send reminder
            .utc(),
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
              const trip = await TripModel.getById(booking.tripId);
              const tripOwner = await UserModel.getById(trip.ownerId);
              //Host email
              await sendEmail({
                emails: [tripOwner['email']],
                name: tripOwner['firstName'],
                subject:
                  EmailMessages.BOOKING_REQUEST_24_HOURS_LEFT_HOST.subject,
                message: EmailMessages.BOOKING_REQUEST_24_HOURS_LEFT_HOST.message(
                  trip._id.toString(),
                  trip['title']
                ),
              });
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
        createdAt: {
          $lt: moment()
            .subtract(1, 'days') // 24 hours remaining send reminder
            .utc(),
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
      bookings.forEach(async booking => {
        promises.push(
          new Promise(async resolve => {
            try {
              const trip = await TripModel.getById(booking.tripId);
              const tripOwner = await UserModel.getById(trip.ownerId);
              //Host email
              await sendEmail({
                emails: [tripOwner['email']],
                name: tripOwner['firstName'],
                subject:
                  EmailMessages.BOOKING_REQUEST_24_HOURS_LEFT_HOST.subject,
                message: EmailMessages.BOOKING_REQUEST_24_HOURS_LEFT_HOST.message(
                  trip._id.toString(),
                  trip['title']
                ),
              });
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
    // await archiveTrip();
    // await archiveConversation();
    await archiveBookingRequest();
    await notify48hBookingRequest();
    await notify24hBookingRequest();
    return context.logStreamName;
  } catch (err) {
    console.log(err);
  }
};
