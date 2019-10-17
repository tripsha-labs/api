/**
 * @name - Group Message model
 * @description - DB model for Group Messages
 */
import { GroupMessage } from './';

export class GroupMessageModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const groupMessages = GroupMessage.find(filter, select || {});
    if (sort) groupMessages.sort(sort);
    if (pagination) {
      groupMessages.limit(pagination.limit);
      groupMessages.skip(pagination.skip);
    }
    return groupMessages;
  }

  static aggregate(params = {}) {
    return GroupMessage.aggregate(params);
  }

  static count(params = {}) {
    return GroupMessage.countDocuments(params);
  }

  static create(params = {}) {
    const groupMessage = new GroupMessage(params);
    return groupMessage.save();
  }

  static update(id, params = {}) {
    return GroupMessage.updateOne({ _id: id }, { $set: params });
  }

  static delete(params = {}) {
    return GroupMessage.deleteOne(params);
  }

  static getById(id) {
    return GroupMessage.findById(id);
  }
}
