/**
 * @name - memberModel
 * @description - All the schema validation for member handled from here
 */
import Validator from 'fastest-validator';

const memberSchema = {
  tripId: { type: 'string', empty: false },
  memberId: { type: 'string', empty: false },
  status: { type: 'string', optional: true, empty: false },
  isFavorite: { type: 'boolean', optional: true, empty: false },
  addedAt: { type: 'number', optional: true, empty: false },
  $$strict: true,
};

export const memberValidation = new Validator().compile(memberSchema);
