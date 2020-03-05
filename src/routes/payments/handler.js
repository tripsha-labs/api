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
    const stripeCustomer = await PaymentController.saveCard(data);
    return success(stripeCustomer);
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
    const paymentMethods = await PaymentController.listPaymentMethods(
      data.stripeCustomerId
    );

    if (!paymentMethods || paymentMethods.length === 0) {
      throw new Error('No payment methods saved.');
    }

    const paymentIntent = await PaymentController.createPaymentIntent({
      amount: data.amount,
      currency: data.currency,
      customerId: data.stripeCustomerId,
      paymentMethod: paymentMethods[0].id,
    });

    return success(paymentIntent);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};
