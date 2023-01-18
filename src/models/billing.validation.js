/**
 * @name - Billing validator
 * @description - The Billing schema validator.
 */
import Validator from 'fastest-validator';

const billingSchema = {
  tripId: { type: 'string', empty: false },
  $$strict: 'remove',
};

export const createBillingValidation = new Validator().compile(billingSchema);
