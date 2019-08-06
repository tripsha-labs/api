/**
 * @name - messageModel
 * @description - All the schema validation for message handled from here
 */
import Validator from 'fastest-validator';

const messageSchema = {
  id: { type: 'string', empty: false },
  toMemberId: { type: 'string', empty: false },
  fromMemberId: { type: 'string', empty: false },
  sentOn: { type: 'number', empty: false },
  message: { type: 'string', empty: false },
  type: {
    type: 'enum',
    empty: false,
    values: ['text'],
  },
  $$strict: true,
};

export const createMessageValidation = new Validator().compile(messageSchema);
