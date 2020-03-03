/**
 * @name - stripe-api
 * @description - Integration with Stripe API
 */
import stripe from 'stripe';

const STRIPE_SECRET_KEY = 'sk_test_q9TlRhBG6Zrah9xD4ZOLYChu'; // test
// const STRIPE_SECRET_KEY = 'sk_live_rWpYyDneJcw2NoTMCouIJnuh'; // production

const createIntent = async () => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY);
  const intent = await stripeInstance.setupIntents.create();
  return intent.client_secret;
};

const createCustomer = async (paymentMethod, email) => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY);
  const customer = await stripeInstance.customers.create({
    payment_method: paymentMethod,
    email,
  });
  return customer;
};

const listPaymentMethods = async customerId => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY);
  const paymentMethods = await stripeInstance.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
  return paymentMethods;
};

const createPaymentIntent = async ({
  amount,
  currency,
  customerId,
  paymentMethod,
}) => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY);
  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    payment_method: paymentMethod,
    off_session: true,
    confirm: true,
  });
  return paymentIntent;
};

export const StripeAPI = {
  createIntent,
  createCustomer,
  listPaymentMethods,
  createPaymentIntent,
};