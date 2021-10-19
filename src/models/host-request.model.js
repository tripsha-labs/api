/**
 * @name - HostRequest model
 * @description - HostRequest db model
 */
import { HostRequest } from '.';

export class HostRequestModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const hostRequests = HostRequest.find(filter, select || {});
    if (sort) hosts.sort(sort);
    if (pagination) {
      hostRequests.limit(pagination.limit);
      hostRequests.skip(pagination.skip);
    }
    return hostRequests;
  }

  static count(params = {}) {
    return HostRequest.countDocuments(params);
  }

  static create(params = {}) {
    const hostRequest = new HostRequest(params);
    return hostRequest.save();
  }

  static aggregate(params = {}) {
    return HostRequest.aggregate(params);
  }

  static update(filter, params = {}, upsert = { upsert: false }) {
    return HostRequest.updateOne(filter, { $set: params }, upsert);
  }

  static delete(params = {}) {
    return HostRequest.deleteOne(params);
  }

  static getById(id) {
    return HostRequest.findById(id);
  }

  static get(params) {
    return HostRequest.findOne(params);
  }

  static bulkUpdate(params) {
    return HostRequest.collection.bulkWrite(params);
  }
}
