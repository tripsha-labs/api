/**
 * @name - Activity Logs contoller
 * @description - This will handle business logic for Activity Logs module
 */
import { dbConnect } from '../../utils';

import { ActivityLogModel, UserModel } from '../../models';
import { ERROR_KEYS } from '../../constants';
import { prepareCommonFilter } from '../../helpers';

export class ActivityLosController {
  static async listActivites(filter, awsUserId) {
    await dbConnect();
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const query = { audienceIds: { $in: user._id.toString() } };
    const params = {
      filter: query,
      ...prepareCommonFilter(filter, ['createdAt', 'updatedAt']),
    };
    const bookingList = await ActivityLogModel.list(params);
    return {
      data: bookingList,
      count: bookingList.length,
    };
  }
}
