/**
 * @name - Connection model
 * @description - Mongoose DB model for Connection.
 */
import { Connection } from './';

export class ConnectionModel {
  static list(params = {}) {
    return Connection.find(params);
  }

  static get(params = {}) {
    return Connection.findOne(params);
  }

  static distinctConnections(params = {}) {
    return Connection.distinct('connectionId', params);
  }

  static count(params = {}) {
    return Connection.countDocuments(params);
  }

  static delete(params = {}) {
    return Connection.deleteOne(params);
  }

  static addOrUpdate(filter, update) {
    return Connection.updateOne(filter, { $set: update }, { upsert: true });
  }
}
