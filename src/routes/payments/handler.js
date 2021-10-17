/**
 * @name - Payments handlar
 * @description - This will handle all payment related API requests
 */
import { PaymentController } from './payment.ctrl';
import { successResponse, failureResponse } from '../../utils';

/**
 * Create card setup intent
 */
export const createIntent = async (req, res) => {
  try {
    const clientSecret = await PaymentController.createIntent();
    return successResponse(res, clientSecret);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Save card to customer
 */
export const saveCard = async (req, res) => {
  try {
    const data = JSON.parse(req.body) || {};
    if (data.stripeCustomerId) {
      const resp = await PaymentController.attachCard(data);
      return successResponse(res, resp);
    } else {
      const stripeCustomer = await PaymentController.saveCard(
        data,
        req.requestContext.identity.cognitoIdentityId
      );
      return successResponse(res, stripeCustomer);
    }
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Charge credit card
 */
export const createPayment = async (req, res) => {
  try {
    const data = JSON.parse(req.body) || {};
    const paymentIntent = await PaymentController.createPaymentIntent({
      amount: data.amount,
      currency: data.currency,
      customerId: data.stripeCustomerId,
      paymentMethod: data.paymentMethod,
      awsUserId: req.requestContext.identity.cognitoIdentityId,
    });
    return successResponse(res, paymentIntent);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create connect account for hosts
 */
export const verifyConnectAccount = async (req, res) => {
  try {
    const data = JSON.parse(req.body) || {};
    if (!data.code || typeof data.code !== 'string' || data.code.length === 0)
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'code' };
    await PaymentController.validateCode(
      data.code,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * List payment methods
 */
export const listCards = async (req, res) => {
  try {
    const userId = req.requestContext.identity.cognitoIdentityId;
    const paymentMethods = await PaymentController.listPaymentMethods(userId);
    return successResponse(res, paymentMethods);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
