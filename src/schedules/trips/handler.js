import moment from 'moment';
import { dbConnect } from '../../utils';
import { TripModel, MemberModel, ConversationModel } from '../../models';

const archiveTrip = async () => {
  try {
    const filter = {
      endDate: { $lt: parseInt(moment().format('YYYYMMDD')) },
      isArchived: false,
    };
    const select = {
      _id: 1,
    };
    const pagination = {
      limit: 50,
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
  } catch (err) {
    console.log(err);
  }
};
const archiveConversation = async () => {
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
      limit: 25,
    };
    const query = { filter, select, pagination };
    const trips = await TripModel.list(query);
    let tripIds = trips.map(trip => trip._id.toString());
    if (tripIds && tripIds.length > 0)
      await ConversationModel.updateMany(
        { tripId: { $in: tripIds } },
        { isArchived: true }
      );
    if (tripIds && tripIds.length === 25) {
      await archiveConversation();
    }
  } catch (err) {
    console.log(err);
  }
};
// const archiveBookingRequest = async () => {
//   try {
//     const filter = {
//       updatedAt: {
//         $lt:
//           moment()
//             .format('YYYYMMDD')
//         ),
//       },
//       status: 'pending',
//     };
//     const select = {
//       _id: 1,
//     };
//     const pagination = {
//       limit: 25,
//     };
//     const query = { filter, select, pagination };
//     const trips = await TripModel.list(query);
//     let tripIds = trips.map(trip => trip._id.toString());
//     if (tripIds && tripIds.length > 0)
//       await ConversationModel.updateMany(
//         { tripId: { $in: tripIds } },
//         { isArchived: true }
//       );
//     if (tripIds && tripIds.length === 25) {
//       await archiveConversation();
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };
export const tripsWatcher = async (event, context) => {
  try {
    await dbConnect();
    await archiveTrip();
    await archiveConversation();
    // await archiveBookingRequest();
  } catch (err) {
    console.log(err);
  }
};
