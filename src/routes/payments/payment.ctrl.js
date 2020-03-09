/**
 * @name - Payment contoller
 * @description - This will handle business logic for Payment module
 */
import { StripeAPI } from '../../utils';
import { UserModel } from '../../models';

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

  static async listPaymentMethods(customerId) {
    const paymentMethods = await StripeAPI.listPaymentMethods(customerId);
    return paymentMethods.data;
  }

  static async createPaymentIntent({
    amount,
    currency,
    customerId,
    paymentMethod,
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

    const paymentIntent = await StripeAPI.createPaymentIntent({
      amount,
      currency,
      customerId,
      paymentMethod,
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
