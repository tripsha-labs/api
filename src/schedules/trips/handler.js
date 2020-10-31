import moment from 'moment';
import { dbConnect } from '../../utils';
import { TripModel, MemberModel, ConversationModel } from '../../models';

export const tripsWatcher = async (event, context) => {
  try {
    await dbConnect();
    // await TripModel.updateMany(
    //   { isArchived: { $exists: false } },
    //   {
    //     isArchived: true,
    //   }
    // );
    const filter = {
      endDate: { $lt: parseInt(moment().format('YYYYMMDD')) },
      isArchived: false,
    };
    const select = {
      _id: 1,
    };
    const pagination = {
      limit: 25,
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
    // await ConversationModel.updateMany(
    //   { isArchived: { $exists: false } },
    //   {
    //     isArchived: true,
    //   }
    // );
    query['filter'] = {
      endDate: {
        $lt: parseInt(
          moment()
            .add(15, 'days')
            .format('YYYYMMDD')
        ),
      },
      isArchived: false,
    };
    trips = await TripModel.list(query);
    let tripIds = trips.map(trip => trip._id.toString());
    console.log(tripIds);
    if (tripIds && tripIds.length > 0)
      await ConversationModel.updateMany(
        { tripId: { $in: tripIds } },
        { isArchived: true }
      );
  } catch (err) {
    console.log(err);
  }
};
