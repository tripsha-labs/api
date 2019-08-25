import { Message } from './';

export class MessageModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const messages = Message.find(filter, select || {});
    if (sort) messages.sort(sort);
    if (pagination) {
      messages.limit(pagination.limit);
      messages.skip(pagination.skip);
    }
    return messages;
  }

  static count(params = {}) {
    return Message.count(params);
  }

  static create(params = {}) {
    const message = new Message(params);
    return message.save();
  }

  static update(id, params = {}) {
    return Message.updateOne({ _id: id }, { $set: params });
  }

  static delete(params = {}) {
    return Message.deleteOne(params);
  }

  static getById(id) {
    return Message.findById(id);
  }
}
