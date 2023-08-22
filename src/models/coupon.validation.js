/**
 * @name - Coupon validation
 * @description - Coupon schema validator.
 */
import Validator from 'fastest-validator';

const couponSchema = {
  name: { type: 'string', optional: true },
  description: { type: 'string', optional: true },
  couponCode: { type: 'string', required: true, min: 4, max: 12 },
  organizationId: { type: 'string', optional: true },
  discType: {
    type: 'string',
    required: true,
    enum: ['amount', 'percentage'],
  },
  amount: {
    type: 'number',
    required: true,
  },
  expiryDate: {
    type: 'number',
    optional: true,
  },
  applicableType: {
    type: 'string',
    required: true,
    enum: ['site_wide', 'hosts', 'my_trips', 'trips', 'countries', 'tags'],
  },
  specificValues: {
    type: 'array',
  },
  isActive: {
    type: 'boolean',
    required: true,
  },
  $$strict: true,
};

export const couponSchemaValidation = new Validator().compile(couponSchema);
