/**
 * @name - conversation model
 * @description - Mongoose DB model for Conversation.
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

  static updateMany(filter, update) {
    return Conversation.updateMany(filter, { $set: update });
  }

  static delete(params = {}) {
    return Conversation.deleteOne(params);
  }

  static get(params) {
    return Conversation.findOne(params);
  }

  static getAll(params) {
    return Conversation.find(params);
  }

  static addOrUpdate(filter, update) {
    return Conversation.updateMany(filter, { $set: update }, { upsert: true });
  }
}
