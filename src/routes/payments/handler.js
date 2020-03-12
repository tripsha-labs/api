/**
 * @name - Payments handlar
 * @description - This will handle all payment related API requests
 */
import { PaymentController } from './payment.ctrl';
import { success, failure, logError } from '../../utils';

/**
 * Create card setup intent
 */
export const createIntent = async (event, context) => {
  try {
    const clientSecret = await PaymentController.createIntent();
    return success(clientSecret);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};

/**
 * Save card to customer
 */
export const saveCard = async (event, context) => {
  try {
    const data = JSON.parse(event.body) || {};
    if (data.stripeCustomerId) {
      const resp = await PaymentController.attachCard(data);
      return success(resp);
    } else {
      const stripeCustomer = await PaymentController.saveCard(data);
      return success(stripeCustomer);
    }
  } catch (error) {
    logError(error);
    return failure(error);
  }
};

/**
 * Charge credit card
 */
export const createPayment = async (event, context) => {
  try {
    const data = JSON.parse(event.body) || {};
    const paymentIntent = await PaymentController.createPaymentIntent({
      amount: data.amount,
      currency: data.currency,
      customerId: data.stripeCustomerId,
      paymentMethod: data.paymentMethod,
    });
    return success(paymentIntent);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};

/**
 * Create connect account for hosts
 */
export const verifyConnectAccount = async (event, context) => {
  try {
    const data = JSON.parse(event.body) || {};
    const stripeAccountId = await PaymentController.validateCode(data.code);
    return success(stripeAccountId);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};

/**
 * List payment methods
 */
export const listCards = async (event, context) => {
  try {
    const userId = event.requestContext.identity.cognitoIdentityId;
    const paymentMethods = await PaymentController.listPaymentMethods(userId);
    return success(paymentMethods);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};
