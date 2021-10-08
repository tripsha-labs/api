/**
 * @name - Member validation
 * @description - Member schema validator
 */
import Validator from 'fastest-validator';

const memberSchema = {
  tripId: { type: 'string', empty: false },
  memberIds: { type: 'array', items: 'string', empty: false },
  action: {
    type: 'string',
    empty: false,
    enum: ['addMember', 'makeFavorite', 'removeMember', 'makeUnFavorite'],
  },
  message: { type: 'string', empty: true, optional: true },
  forceAddTraveller: { type: 'boolean', empty: true, optional: true },
  $$strict: true,
};

export const memberActionValidation = new Validator().compile(memberSchema);
