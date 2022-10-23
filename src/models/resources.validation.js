/**
 * @name - Resource validator
 * @description - The Resource schema validator.
 */
import Validator from 'fastest-validator';

export const createResourceCollectionValidation = new Validator().compile({
  tripId: { type: 'string', empty: false },
  title: { type: 'string', empty: false },
  $$strict: 'remove',
});
export const updateResourceCollectionValidation = new Validator().compile({
  title: { type: 'string', empty: false },
  $$strict: 'remove',
});
export const createResourceValidation = new Validator().compile({
  title: { type: 'string', empty: false },
  type: { type: 'string', empty: false },
  $$strict: 'remove',
});
export const updateResourceValidation = new Validator().compile({
  title: { type: 'string' },
  type: { type: 'string' },
  $$strict: 'remove',
});
