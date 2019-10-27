/**
 * @name - Message validator
 * @description - This will validate message schema
 */
import Validator from 'fastest-validator';

const messageSchema = {
  toMemberId: { type: 'string', empty: false },
  tripId: { type: 'string', empty: false },
  message: { type: 'string', empty: false },
  messageType: {
    type: 'enum',
    empty: false,
    values: ['text', 'image', 'video', 'audio'],
    optional: true,
  },
  mediaUrl: { type: 'string', empty: false },
  isGroupMessage: { type: Boolean, empty: false, default: false },
  isEdited: { type: Boolean, empty: false, default: false },
  $$strict: true,
};

export const createMessageValidation = new Validator().compile(messageSchema);
