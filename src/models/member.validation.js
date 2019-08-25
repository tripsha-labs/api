import Validator from 'fastest-validator';

const memberSchema = {
  tripId: { type: 'string', empty: false },
  memberIds: { type: 'array', items: 'string', empty: false },
  action: {
    type: 'string',
    empty: false,
    enum: ['addMember', 'makeFavorite', 'removeMember', 'makeUnFavorite'],
  },
  $$strict: true,
};

export const memberActionValidation = new Validator().compile(memberSchema);
