/**
 * @name - conversation model
 * @description - Mongouse DB model for Conversation
 */
import { Conversation } from './';

export class ConversationModel {
  static count(params = {}) {
    return Conversation.countDocuments(params);
  }

  static aggregate(params) {
    return Conversation.aggregate(params);
  }

  static create(params = {}) {
    const conversation = new Conversation(params);
    return conversation.save();
  }

  static updateOne(filter, update) {
    return Conversation.updateOne(filter, { $set: update });
  }

  static delete(params = {}) {
    return Conversation.deleteOne(params);
  }

  static get(params) {
    return Conversation.findOne(params);
  }

  static addOrUpdate(filter, update) {
    return Conversation.update(filter, { $set: update }, { upsert: true });
  }
}
