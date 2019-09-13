/**
 * @name - User model
 * @description - This is User db model, all opearations for users wiith DB handled here
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

  static update(filter, params = {}) {
    return User.updateOne(filter, { $set: params });
  }

  static delete(params = {}) {
    return User.deleteOne(params);
  }

  static getById(id) {
    return User.findById(id);
  }

  static get(params) {
    return User.findOne(params);
  }

  static getUserByAWSUsername(username) {
    return User.findOne({ awsUsername: username });
  }
}
