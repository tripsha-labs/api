/**
 * @name - memberModel
 * @description - All the schema validation for member handled from here
 */
import Validator from 'fastest-validator';

const memberSchema = {
  tripId: { type: 'string', empty: false },
  memberId: { type: 'string', empty: false },
  action: {
    type: 'string',
    empty: false,
    enum: ['addMember', 'makeFavorite', 'removeMember', 'makeUnFavorite'],
  },
  $$strict: true,
};

export const memberValidation = new Validator().compile(memberSchema);
