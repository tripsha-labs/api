import moment from 'moment';
import { dbConnect, sendEmail } from '../../utils';
import { EmailMessages, LogMessages } from '../../constants';
import {
  TripModel,
  MemberModel,
  ConversationModel,
  BookingModel,
  UserModel,
} from '../../models';

const archiveTrip = async (page = 0) => {
  console.log('Archiving trips...', page);
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
      skip: 500 * page,
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
      archiveTrip(page + 1);
    }
  } catch (err) {
    console.log(err);
  }
};
const archiveConversation = async (page = 0) => {
  console.log('Archiving conversations...', page);
  try {
    const filter = {
      endDate: {
        $lt: parseInt(
          moment()
            .add(15, 'days')
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
      skip: page * 500,
    };
    const query = { filter, select, pagination };
    const trips = await TripModel.list(query);
    let tripIds = trips.map(trip => trip._id.toString());
    if (tripIds && tripIds.length > 0)
      await ConversationModel.updateMany(
        { tripId: { $in: tripIds } },
        { isArchived: true }
      );
    console.log('Acrhived conversations:', tripIds.length);
    if (tripIds.length > 0) {
      await archiveConversation(page + 1);
    }
  } catch (err) {
    console.log(err);
  }
};
const archiveBookingRequest = async (page = 0) => {
  console.log('Archiving booking request');
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
      skip: 100 * page,
    });
    if (bookings.length > 0) {
      bookings.forEach(async booking => {
        await BookingModel.update(booking._id, {
          status: 'expired',
        });
        const trip = await TripModel.getById(booking.tripId);
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
          subject: EmailMessages.BOOKING_REQUEST_EXPIRED_TRAVELLER.subject,
          message: EmailMessages.BOOKING_REQUEST_EXPIRED_TRAVELLER.message(
            booking._id,
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
            trip['title']
          ),
        });
      });
      archiveBookingRequest(page + 1);
      console.log('Archived booking request', bookingrequests);
    }
  } catch (err) {
    console.log(err);
  }
};
const notifyBookingRequest = async (page = 0) => {
  console.log('Archiving booking request');
  try {
    const bookings = await BookingModel.list({
      filter: {
        createdAt: {
          $lt: moment()
            .subtract(2, 'days') // 24 hours remaining send reminder
            .utc(),
        },
        status: 'pending',
        isEmailSent: false,
      },
      select: {
        _id: 1,
        tripId: 1,
        memberId: 1,
      },
      limit: 100,
      skip: 100 * page,
    });
    if (bookings.length > 0) {
      bookings.forEach(async booking => {
        const trip = await TripModel.getById(booking.tripId);
        const tripOwner = await UserModel.getById(trip.ownerId);
        //Host email
        await sendEmail({
          emails: [tripOwner['email']],
          name: tripOwner['firstName'],
          subject: EmailMessages.BOOKING_REQUEST_24_HOURS_LEFT_HOST.subject,
          message: EmailMessages.BOOKING_REQUEST_24_HOURS_LEFT_HOST.message(
            trip._id.toString(),
            trip['title']
          ),
        });
        await BookingModel.update(booking._id, {
          status: 'expired',
          isEmailSent: true,
        });
      });
      notifyBookingRequest(page + 1);
      console.log('Archived booking request', bookingrequests);
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
  } catch (err) {
    console.log(err);
  }
};
