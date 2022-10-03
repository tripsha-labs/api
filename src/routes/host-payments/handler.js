/**
 * @name - Payments handlar
 * @description - This will handle all payment related API requests
 */
import { PaymentController } from './payment.ctrl';
import { successResponse, failureResponse, logError } from '../../utils';
import { createPaymentValidation, updatePaymentValidation } from '../../models';
import { ERROR_KEYS } from '../../constants';

/**
 * Create payment
 */
export const createPayment = async (req, res) => {
  try {
    const data = req.body || {};

    const validation = createPaymentValidation(data);
    if (validation != true) throw validation.shift();

    const result = await PaymentController.createPayment(
      data,
      req.requestContext.identity.cognitoIdentityId
    );

    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

/**
 *  List all payments created
 */
export const listPayments = async (req, res) => {
  try {
    const params = req.query ? req.query : {};
    let result = [];

    result = await PaymentController.listPayments(
      params,
      req.requestContext.identity.cognitoIdentityId
    );

    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 *  Get payment details
 */
export const getPayment = async (req, res) => {
  try {
    const data = req.body || {};
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await PaymentController.getPayment(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

/**
 * Update payment
 */
export const updatePayment = async (req, res) => {
  try {
    const paymentId = req.params && req.params.id;
    if (!paymentId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const data = req.body || {};
    const validation = updatePaymentValidation(data);
    if (validation != true) throw validation.shift();
    const result = await PaymentController.updatePayment(paymentId, data);
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

export const multiDeletePayment = async (req, res) => {
  try {
    const data = req.body || {};
    if (data && !data.hasOwnProperty('paymentIds'))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'paymentIds' };
    const result = await PaymentController.multiDeletePayment(data.paymentIds);
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};
