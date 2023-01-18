/**
 * @name - stripe-api
 * @description - Integration with Stripe API
 */
import stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const HOST_PAYMENT_PART = 72;
const createIntent = async () => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY, { maxNetworkRetries: 3 });
  const intent = await stripeInstance.setupIntents.create();
  return intent.client_secret;
};

const createCustomer = async (paymentMethod, email) => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY, { maxNetworkRetries: 3 });
  const customer = await stripeInstance.customers.create({
    payment_method: paymentMethod,
    email,
  });
  return customer;
};

const attachCard = async (paymentMethod, stripeCustomerId) => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY, { maxNetworkRetries: 3 });
  const resp = await stripeInstance.paymentMethods.attach(paymentMethod, {
    customer: stripeCustomerId,
  });
  return resp;
};

const detachCard = async paymentMethod => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY, { maxNetworkRetries: 3 });
  const resp = await stripeInstance.paymentMethods.detach(paymentMethod);
  return resp;
};

const listPaymentMethods = async customerId => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY, { maxNetworkRetries: 3 });
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
  beneficiary,
  metadata,
  hostShare = HOST_PAYMENT_PART,
}) => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY, { maxNetworkRetries: 3 });
  const paymentIntentPayload = {
    payment_method_types: ['card'],
    amount,
    currency,
    customer: customerId,
    payment_method: paymentMethod,
    off_session: true,
    confirm: true,
    metadata,
  };
  if (beneficiary) {
    paymentIntentPayload['transfer_data'] = {
      amount: parseInt((amount * hostShare) / 100),
      destination: beneficiary,
    };
  }
  const paymentIntent = await stripeInstance.paymentIntents.create(
    paymentIntentPayload
  );
  return paymentIntent;
};

const validateCode = code => {
  const stripeInstance = stripe(STRIPE_SECRET_KEY, { maxNetworkRetries: 3 });
  return stripeInstance.oauth.token({
    grant_type: 'authorization_code',
    code,
  });
};

export const StripeAPI = {
  createIntent,
  createCustomer,
  attachCard,
  listPaymentMethods,
  createPaymentIntent,
  validateCode,
  detachCard,
};
