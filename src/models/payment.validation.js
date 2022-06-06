/**
 * @name - Payment validator
 * @description - Payment schema validator.
 */
import Validator from 'fastest-validator';

const paymentSchema = {
  description: { type: 'string', empty: false },
  paymentType: { type: 'string', empty: false },
  paymentDate: { type: 'string', empty: false },
  paymentMethod: {
    type: 'string',
    empty: false,
  },
  attachments: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      optional: true,
      props: {
        id: { type: 'string' },
        type: { type: 'string', optional: true },
        url: { type: 'string', optional: true },
      },
    },
  },
  amount: { type: 'string', empty: false },
  $$strict: 'remove',
};

const paymentpUpdateSchema = {
  ...paymentSchema,
};

export const createPaymentValidation = new Validator().compile(paymentSchema);
export const updatePaymentValidation = new Validator().compile(
  paymentpUpdateSchema
);
