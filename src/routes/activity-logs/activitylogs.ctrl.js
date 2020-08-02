/**
 * @name - Activity Logs contoller
 * @description - This will handle business logic for Activity Logs module
 */
import { dbConnect } from '../../utils';

import { ActivityLogModel, UserModel } from '../../models';
import { ERROR_KEYS } from '../../constants';

export class ActivityLosController {
  static async listActivites(filters, awsUserId) {
    await dbConnect();
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;

    const params = { userId: user._id.toString() };

    const bookingList = ActivityLogModel.list(params);
    return bookingList;
  }
}
