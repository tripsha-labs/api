import moment from 'moment';
import { dbConnect } from '../../utils';
import { TripModel, MemberModel } from '../../models';
export const tripsWatcher = async (event, context) => {
  try {
    await dbConnect();
    const filter = {
      endDate: { $lt: parseInt(moment().format('YYYYMMDD')) },
      isArchived: false,
    };
    const trips = await TripModel.list({ filter });
    trips.map(async trip => {
      const memberCount = await MemberModel.count({ tripId: trip._id });
      await TripModel.update(trip._id, {
        isArchived: true,
        status: memberCount > 1 ? 'completed' : 'cancelled',
      });
    });
  } catch (err) {
    console.log(err);
  }
};
