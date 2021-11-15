/**
 * @name - Coupons API Handler
 * @description - This handles API requests
 */
import { successResponse, failureResponse } from '../../utils';
import { CouponController } from './coupon.ctrl';
import { couponSchemaValidation } from '../../models';
import { ERROR_KEYS } from '../../constants';
/**
 * List coupons
 */
export const listCoupons = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query ? req.query : {};
    const result = await CouponController.listCoupons(
      params,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const createCoupon = async (req, res) => {
  try {
    const params = req.body || {};
    const errors = couponSchemaValidation(params);
    if (errors != true) throw errors.shift();
    const result = await CouponController.createCoupon(
      params,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const params = req.body || {};
    const errors = couponSchemaValidation(params);
    if (errors != true) throw errors.shift();
    const result = await CouponController.updateCoupon(params, req.params.id);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
export const deleteCoupon = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await CouponController.deleteCoupon(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
export const applyCoupon = async (req, res) => {
  try {
    const params = req.body || {};
    if (!params.couponCode)
      throw {
        ...ERROR_KEYS.MISSING_FIELD,
        field: 'couponCode',
      };
    if (!params.tripId)
      throw {
        ...ERROR_KEYS.MISSING_FIELD,
        field: 'tripId',
      };
    const result = await CouponController.applyCoupon(params);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
