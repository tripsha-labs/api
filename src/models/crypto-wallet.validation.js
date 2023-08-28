/**
 * @name - Coupon validation
 * @description - Coupon schema validator.
 */
import Validator from 'fastest-validator';

const walletSchema = {
  address: { type: 'string' },
  chainId: { type: 'number' },
  $$strict: true,
};

export const walletSchemaValidation = new Validator().compile(walletSchema);
