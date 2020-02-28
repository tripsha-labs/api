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
    // TODO: add `customer.id` to User in MongoDB
    return customer;
  }

  static async listPaymentMethods(customerId) {
    const paymentMethods = await StripeAPI.listPaymentMethods(customerId);
    return paymentMethods.data;
  }

  static async createPaymentIntent({
    amount,
    currency,
    userId,
    paymentMethod,
  }) {
    // const user = await UserModel.get({ awsUserId: userId })
    // const customerId = user.stripeCustomerId
    const customerId = userId; // just for testing

    if (!amount || Number.isNaN(amount)) {
      throw new Error('Invalid payment amount.');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Invalid payment currency.');
    }
    // if (!user || !user.stripeCustomerId) {
    //   throw new Error('Could not find Stripe customerId.')
    // }
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
}
