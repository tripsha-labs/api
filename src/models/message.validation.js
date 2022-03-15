/**
 * @name - Message validator
 * @description - This will validate message schema.
 */
import Validator from 'fastest-validator';

const messageSchema = {
  toMemberId: { type: 'string', empty: false, default: '', optional: true },
  tripId: { type: 'string', empty: false, default: '', optional: true },
  message: { type: 'string', empty: false },
  messageType: {
    type: 'enum',
    empty: false,
    values: ['text', 'image', 'video', 'audio', 'info'],
    optional: true,
  },
  mediaUrl: { type: 'string', empty: false, default: '', optional: true },
  isGroupMessage: {
    type: 'boolean',
    empty: false,
    default: false,
    optional: true,
  },
  isEdited: { type: 'boolean', empty: false, default: false, optional: true },
  $$strict: true,
};

export const createMessageValidation = new Validator().compile(messageSchema);
