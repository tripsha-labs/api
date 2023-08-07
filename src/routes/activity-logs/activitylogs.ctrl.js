/**
 * @name - Activity Logs contoller
 * @description - This will handle business logic for Activity Logs module
 */
import { ActivityLogModel, UserModel } from '../../models';
import { ERROR_KEYS } from '../../constants';
import { prepareCommonFilter } from '../../helpers';

export class ActivityLosController {
  static async listActivites(filter, user) {
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const query = { audienceIds: { $in: user._id } };
    if (filter?.hasOwnProperty('cleared'))
      query['cleared'] = filter.cleared || false;
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

  static async updateActivities(filter, user) {
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const query = { audienceIds: { $in: user._id } };
    const payload = {};
    if (filter?.hasOwnProperty('clearAll') && filter.clearAll) {
      payload['cleared'] = true;
    }
    if (filter?.hasOwnProperty('markAsRead') && filter.markAsRead) {
      payload['unread'] = false;
    }

    const bookingList = await ActivityLogModel.updateMany(query, payload);
    return {
      data: bookingList,
      count: bookingList.length,
    };
  }
}
