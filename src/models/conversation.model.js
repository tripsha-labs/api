import { Conversation } from './';

export class ConversationModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const conversations = Conversation.find(filter, select || {});
    if (sort) conversations.sort(sort);
    if (pagination) {
      conversations.limit(pagination.limit);
      conversations.skip(pagination.skip);
    }
    return conversations;
  }

  static count(params = {}) {
    return Conversation.count(params);
  }

  static create(params = {}) {
    const conversation = new Conversation(params);
    return conversation.save();
  }

  static update(id, params = {}) {
    return Conversation.updateOne({ _id: id }, { $set: params });
  }

  static delete(params = {}) {
    return Conversation.deleteOne(params);
  }

  static getById(id) {
    return Conversation.findById(id);
  }
}
