/**
 * @name - Activity Logs model
 * @description - This is booking model, where all db opeartion related to activity logs, performed from here
 */
import { ActivityLog } from '.';

export class ActivityLogModel {
  static list(params = {}) {
    const bookings = ActivityLog.find(params);
    return bookings;
  }

  static count(params = {}) {
    return ActivityLog.countDocuments(params);
  }

  static create(params = {}) {
    const booking = new ActivityLog(params);
    return booking.save();
  }

  static update(id, params = {}) {
    return ActivityLog.updateOne({ _id: id }, { $set: params });
  }

  static aggregate(params = {}) {
    return ActivityLog.aggregate(params);
  }

  static delete(params = {}) {
    return ActivityLog.deleteOne(params);
  }

  static getById(id) {
    return ActivityLog.findById(id);
  }

  static get(params) {
    return ActivityLog.findOne(params);
  }
}
