/**
 * @name - Payment contoller
 * @description - This will handle business logic for Payment module
 */
import { StripeAPI, dbConnect } from '../../utils';
import { UserModel } from '../../models';
import { ERROR_KEYS } from '../../constants';

export class PaymentController {
  static async createIntent() {
    const clientSecret = await StripeAPI.createIntent();
    return clientSecret;
  }

  static async saveCard(data) {
    const { paymentMethod, email } = data;
    if (!paymentMethod) throw new Error('Missing payment method.');
    if (!email) throw new Error('Missing email.');
    const customer = await StripeAPI.createCustomer(paymentMethod, email);
    return customer;
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
      await dbConnect();
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

    await dbConnect();
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
    });

    return paymentIntent;
  }

  static async validateCode(code) {
    if (!code || typeof code !== 'string' || code.length === 0) {
      throw new Error('Missing or invalid authorization code.');
    }

    const accountId = await StripeAPI.validateCode(code);
    return accountId;
  }
}
