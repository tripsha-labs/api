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
    const users = User.count(params);
    return users;
  }

  static create(params = {}) {
    const user = new User(params);
    return user.save();
  }

  static update(id, params = {}) {
    return User.updateOne({ _id: id }, { $set: params });
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
    return User.findOne({ awsUesrname: username });
  }
}
