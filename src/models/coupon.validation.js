/**
 * @name - Coupon validation
 * @description - Coupon schema validator
 */
import Validator from 'fastest-validator';

const couponSchema = {
  name: { type: 'string', optional: true },
  couponCode: { type: 'string', required: true },
  discType: {
    type: 'string',
    required: true,
    enum: ['%', '$'],
  },
  amount: {
    type: 'number',
    required: true,
  },
  expiryDate: {
    type: 'number',
    required: true,
  },
  tripIds: {
    type: 'array',
    required: true,
  },
  isActive: {
    type: 'boolean',
    required: true,
  },
  $$strict: true,
};

export const couponSchemaValidation = new Validator().compile(couponSchema);
