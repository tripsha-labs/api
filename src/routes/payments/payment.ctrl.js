/**
 * @name - Payment contoller
 * @description - This will handle business logic for Payment module
 */
import { StripeAPI } from '../../utils';
import { BookingModel, UserModel } from '../../models';
import { ERROR_KEYS } from '../../constants';

export class PaymentController {
  static async createIntent() {
    const clientSecret = await StripeAPI.createIntent();
    return clientSecret;
  }

  static async saveCard(data, awsUserId) {
    const { paymentMethod, email } = data;
    if (!paymentMethod) throw new Error('Missing payment method.');
    if (!email) throw new Error('Missing email.');
    const customer = await StripeAPI.createCustomer(paymentMethod, email);
    if (customer && customer.id) {
      if (!customer.id) throw new Error('Missing Stripe Customer ID.');
      const resp = await StripeAPI.attachCard(paymentMethod, customer.id);
      await UserModel.update(
        { awsUserId: awsUserId },
        { stripeCustomerId: customer.id }
      );
      return resp;
    } else {
      throw new Error('Missing Stripe Customer ID.');
    }
  }

  static async attachCard(data) {
    const { paymentMethod, stripeCustomerId } = data;
    if (!paymentMethod) throw new Error('Missing payment method.');
    if (!stripeCustomerId) throw new Error('Missing Stripe Customer ID.');
    const resp = await StripeAPI.attachCard(paymentMethod, stripeCustomerId);
    return resp;
  }

  static async listPaymentMethods(userId) {
    try {
      const user = await UserModel.get({ awsUserId: userId });
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      const paymentMethods = await StripeAPI.listPaymentMethods(
        user.stripeCustomerId
      );
      return paymentMethods.data;
    } catch (e) {
      throw e;
    }
  }

  static async createPaymentIntent({
    amount,
    currency,
    customerId,
    paymentMethod,
    awsUserId,
  }) {
    if (!amount || Number.isNaN(amount)) {
      throw new Error('Invalid payment amount.');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Invalid payment currency.');
    }
    if (!customerId) {
      throw new Error('Could not find Stripe customerId.');
    }

    if (!paymentMethod) {
      throw new Error('Missing Stripe paymentMethodId.');
    }

    const user = await UserModel.get({ awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    if (!user.stripeAccountId)
      throw new Error('Host does not have a Stripe account.');
    const beneficiary = user.stripeAccountId;
    const paymentIntent = await StripeAPI.createPaymentIntent({
      amount,
      currency,
      customerId,
      paymentMethod,
      beneficiary,
      hostShare: user.hostShare,
    });

    return paymentIntent;
  }

  static async validateCode(code, awsUserId) {
    try {
      const user = await UserModel.get({ awsUserId: awsUserId });
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      const accountDetails = await StripeAPI.validateCode(code);
      const user_info = {
        stripeAccountId: accountDetails.stripe_user_id,
        isStripeAccountConnected: true,
      };
      await UserModel.update({ awsUserId: awsUserId }, user_info);
      return 'success';
    } catch (error) {
      console.log(error);
      throw new Error('Invalid authorization code.');
    }
  }
  static async deleteCard(cardId) {
    const bookingCount = await BookingModel.count({
      currentDue: { $gt: 0 },
      paymentMethod: cardId,
    });

    if (bookingCount > 0) {
      throw ERROR_KEYS.CARD_DELETE_FAILED;
    }
    try {
      await StripeAPI.detachCard(cardId);
      return 'success';
    } catch (error) {
      console.log(error.type);
      if (error.type === 'StripeInvalidRequestError')
        throw {
          type: error.raw.type,
          message: error.raw.message,
          code: error.raw.statusCode,
        };
      else throw new Error('Failed to delete');
    }
  }
}
