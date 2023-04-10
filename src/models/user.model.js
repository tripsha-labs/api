/**
 * @name - User model
 * @description - User DB model, where all DB operations for users handled here.
 */
import { User } from './';

export class UserModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const users = User.find(filter, select || {});
    if (sort) users.sort(sort);
    if (pagination) {
      users.limit(pagination.limit);
      users.skip(pagination.skip);
    }
    return users;
  }

  static count(params = {}) {
    return User.countDocuments(params);
  }

  static create(params = {}) {
    const user = new User(params);
    return user.save();
  }
  static insertMany(params = []) {
    return User.insertMany(params);
  }
  static update(filter, params = {}) {
    return User.updateOne(filter, { $set: params });
  }

  static delete(params = {}) {
    return User.deleteOne(params);
  }

  static getById(id) {
    return User.findById(id);
  }

  static get(params, select = {}) {
    return User.findOne(params, select);
  }

  static getUserByAWSUsername(username, select = {}) {
    return User.findOne({ awsUsername: username }, select);
  }
  static bulkWrite(params) {
    return User.bulkWrite(params);
  }
  static aggregate(params) {
    return User.aggregate(params);
  }
}
