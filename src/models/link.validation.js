/**
 * @name - Link validator
 * @description - The Link schema validator.
 */
import Validator from 'fastest-validator';

const linkShema = {
  title: { type: 'string', empty: false, required: true },
  description: { type: 'string', optional: true },
  url: { type: 'string', empty: false, required: true },
  tripId: { type: 'string', empty: false, required: true },
};
export const createLinkValidation = new Validator().compile({
  ...linkShema,
  $$strict: 'remove',
});
export const updateLinkValidation = new Validator().compile({
  ...linkShema,
  $$strict: 'remove',
});
