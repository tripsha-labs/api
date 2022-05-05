/**
 * @name - Coupon Controller
 * @description - This will handle all business logic for Coupon
 */
import { Types } from 'mongoose';
import moment from 'moment';
import { CouponModel, UserModel, TripModel } from '../../models';
import { prepareCommonFilter } from '../../helpers';
import { ERROR_KEYS } from '../../constants';

export class CouponController {
  static async listCoupons(filter, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const params = {
      filter: {
        name: { $regex: new RegExp('^' + (filter.search || ''), 'i') },
      },
      ...prepareCommonFilter(filter, ['name']),
    };
    if (user.isAdmin || user.isHost) {
      if (user.isHost && !user.isAdmin) {
        params['filter']['userId'] = user._id.toString();
      }
    } else {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
    const coupons = await CouponModel.list(params);
    return {
      data: coupons,
      count: coupons.length,
    };
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
    const coupon = await CouponModel.get({
      couponCode: params.couponCode,
      isActive: true,
    });
    if (coupon.expiryDate)
      if (coupon.expiryDate < parseInt(moment().format('YYYYMMDD')))
        throw ERROR_KEYS.INVALID_COUPON_CODE;
    const trip = await TripModel.get({
      _id: Types.ObjectId(params.tripId),
      ownerId: Types.ObjectId(coupon.userId),
    });
    //name: 1, discType: 1, amount: 1, couponCode: 1

    let validCoupon = null;
    if (coupon) {
      switch (coupon.applicableType) {
        case 'site_wide':
          validCoupon = coupon;
          break;
        case 'my_trips':
          if (trip) validCoupon = coupon;
          break;
        case 'trips':
          coupon.specificValues.map(tripId => {
            if (tripId === params.tripId) validCoupon = coupon;
          });
          break;
        case 'countries':
          if (trip)
            coupon.specificValues.map(country => {
              if (trip.destinations.includes(country)) validCoupon = coupon;
            });
          break;
        case 'tags':
          if (trip)
            coupon.specificValues.map(tag => {
              if (trip.interests.includes(tag)) validCoupon = coupon;
            });
          break;
        case 'hosts':
          if (trip)
            coupon.specificValues.map(host => {
              if (host === trip.ownerId.toString()) validCoupon = coupon;
            });
          break;
        default:
          validCoupon = null;
      }
    }
    if (validCoupon)
      return {
        _id: validCoupon._id,
        name: validCoupon.name,
        discType: validCoupon.discType,
        amount: validCoupon.amount,
        couponCode: validCoupon.couponCode,
      };
    else throw ERROR_KEYS.INVALID_COUPON_CODE;
  }
  static async getTrips(couponId) {
    const coupon = await CouponModel.getById(couponId);
    let tripIds = [];
    if (
      coupon &&
      coupon.applicableType === 'trips' &&
      coupon.specificValues &&
      coupon.specificValues.length > 0
    ) {
      tripIds = coupon.specificValues.map(tripId => Types.ObjectId(tripId));
    }
    if (tripIds.length > 0) {
      return await TripModel.list({
        filter: { _id: { $in: tripIds } },
        select: {
          title: 1,
          description: 1,
          startDate: 1,
          endDate: 1,
          isArchived: 1,
          thumbnailUrls: 1,
          pictureUrls: 1,
          status: 1,
        },
      });
    } else return [];
  }
  static async getHosts(couponId) {
    const coupon = await CouponModel.getById(couponId);
    let hostIds = [];
    if (
      coupon &&
      coupon.applicableType === 'hosts' &&
      coupon.specificValues &&
      coupon.specificValues.length > 0
    ) {
      hostIds = coupon.specificValues.map(hostId => Types.ObjectId(hostId));
    }
    if (hostIds.length > 0) {
      return await UserModel.list({
        filter: { _id: { $in: hostIds } },
        select: {
          firstName: 1,
          lastName: 1,
          avatarUrl: 1,
          endDate: 1,
          username: 1,
        },
      });
    } else return [];
  }
}
