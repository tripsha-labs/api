/**
 * @name - Group Message validator
 * @description - This will validate group message schema
 */
import Validator from 'fastest-validator';

const groupMessageSchema = {
  groupId: { type: 'string', empty: false },
  message: { type: 'string', empty: false },
  messageType: {
    type: 'enum',
    empty: false,
    values: ['text'],
    optional: true,
  },
  $$strict: true,
};

export const createGroupMessageValidation = new Validator().compile(
  groupMessageSchema
);
