import { Member } from './';

export class MemberModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const members = Member.find(filter, select || {});
    if (sort) members.sort(sort);
    if (pagination) {
      members.limit(pagination.limit);
      members.skip(pagination.skip);
    }
    return members;
  }

  static count(params = {}) {
    return Member.count(params);
  }

  static create(params = {}) {
    const member = new Member(params);
    return member.save();
  }

  static aggregate(params = {}) {
    return Member.aggregate(params);
  }

  static update(filter, params = {}) {
    return Member.updateOne(filter, { $set: params });
  }

  static delete(params = {}) {
    return Member.deleteOne(params);
  }

  static getById(id) {
    return Member.findById(id);
  }

  static get(params) {
    return Member.findOne(params);
  }

  static bulkUpdate(params) {
    return Member.collection.bulkWrite(params);
  }
}
