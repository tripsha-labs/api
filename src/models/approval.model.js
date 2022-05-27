/**
 * @name - ApprovalModel model
 * @description - ApprovalModel db model
 */
import { Approval } from '.';

export class ApprovalModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const approvals = Approval.find(filter, select || {});
    if (sort) approvals.sort(sort);
    if (pagination) {
      approvals.limit(pagination.limit);
      approvals.skip(pagination.skip);
    }
    return approvals;
  }

  static count(params = {}) {
    return Approval.countDocuments(params);
  }

  static create(params = {}) {
    const approval = new Approval(params);
    return approval.save();
  }

  static aggregate(params = {}) {
    return Approval.aggregate(params);
  }

  static update(filter, params = {}, upsert = { upsert: false }) {
    return Approval.updateOne(filter, { $set: params }, upsert);
  }

  static delete(params = {}) {
    return Approval.deleteOne(params);
  }

  static getById(id) {
    return Approval.findById(id);
  }

  static get(params) {
    return Approval.findOne(params);
  }

  static bulkUpdate(params) {
    return Approval.collection.bulkWrite(params);
  }
}
