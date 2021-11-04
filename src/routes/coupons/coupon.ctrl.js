/**
 * @name - Coupon Controller
 * @description - This will handle all business logic for Coupon
 */
import { Types } from 'mongoose';
import moment from 'moment';
import { CouponModel, UserModel } from '../../models';
import { prepareCommonFilter } from '../../helpers';

export class CouponController {
  static async listCoupons(filter) {
    try {
      const params = {
        filter: {
          name: { $regex: new RegExp('^' + (filter.search || ''), 'i') },
        },
        ...prepareCommonFilter(filter, ['name']),
      };
      const coupons = await CouponModel.list(params);
      return {
        data: coupons,
        count: coupons.length,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async createCoupon(params, awsUserId) {
    const user = await UserModel.get({
      awsUserId: awsUserId,
    });
    params['userId'] = user._id.toString();
    return await CouponModel.create(params);
  }
  static async updateCoupon(params, couponId) {
    await CouponModel.update({ _id: Types.ObjectId(couponId) }, params);
    return 'success';
  }
  static async deleteCoupon(couponId) {
    await CouponModel.delete({ _id: Types.ObjectId(couponId) });
    return 'success';
  }
  static async getCoupon(couponId) {
    return await CouponModel.getById(couponId);
  }
  static async applyCoupon(params) {
    const couponDetails = await CouponModel.get(
      {
        couponCode: params.couponCode,
        tripIds: params.tripId,
        isActive: true,
        expiryDate: { $gte: parseInt(moment().format('YYYYMMDD')) },
      },
      { tripIds: 0, maxRedemptions: 0, timesRedeemed: 0 }
    );
  }
}
