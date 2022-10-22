/**
 * @name - Payment validator
 * @description - Payment schema validator.
 */
import Validator from 'fastest-validator';

const paymentSchema = {
  description: { type: 'string', empty: false, optional: true },
  paymentType: { type: 'string', empty: false, optional: true },
  paymentDate: { type: 'number', empty: false, optional: true },
  paymentMethod: {
    type: 'string',
    empty: false,
    optional: true,
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
        name: { type: 'string', optional: true },
        url: { type: 'string', optional: true },
      },
    },
  },
  comments: {
    type: 'array',
    optional: true,
    items: {
      type: 'object',
      optional: true,
      props: {
        id: { type: 'string' },
        message: { type: 'string', optional: true },
        createdAt: { type: 'string', optional: true },
      },
    },
  },
  amount: { type: 'number', empty: false, optional: true },
  currencyType: { type: 'string', empty: false, optional: true },
  foreignAmount: { type: 'number', empty: false, optional: true },
  type: {
    type: 'string',
    empty: false,
    optional: true,
    enum: ['Paid', 'Received'],
  },
  $$strict: 'remove',
};

const paymentpUpdateSchema = {
  ...paymentSchema,
};

export const createPaymentValidation = new Validator().compile(paymentSchema);
export const updatePaymentValidation = new Validator().compile(
  paymentpUpdateSchema
);
