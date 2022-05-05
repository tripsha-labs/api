import { successResponse, failureResponse } from '../../utils';
import { tripsWatcher } from '../../schedules/trips/handler';

export const runSchedule = async (req, res) => {
  try {
    await tripsWatcher({}, {});
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
