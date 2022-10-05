/**
 * @name - CouponModel model
 * @description - CouponModel DB model.
 */
import { Coupon } from '.';

export class CouponModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const coupons = Coupon.find(filter, select || {});
    if (sort) coupons.sort(sort);
    if (pagination) {
      coupons.limit(pagination.limit);
      coupons.skip(pagination.skip);
    }
    return coupons;
  }

  static count(params = {}) {
    return Coupon.countDocuments(params);
  }

  static create(params = {}) {
    const coupon = new Coupon(params);
    return coupon.save();
  }

  static update(filter, params = {}, upsert = { upsert: false }) {
    return Coupon.updateOne(filter, { $set: params }, upsert);
  }

  static delete(params = {}) {
    return Coupon.deleteOne(params);
  }

  static getById(id) {
    return Coupon.findById(id);
  }

  static get(params, select) {
    return Coupon.findOne(params, select || {});
  }
}
