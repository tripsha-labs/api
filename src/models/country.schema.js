/**
 * @name - countryModel
 * @description - All the schema validation for country handled from here
 */
import Validator from 'fastest-validator';

export const countrySchema = {
  code: { type: 'string', empty: false },
  name: { type: 'string', empty: false },
};

export const countryValidation = new Validator().compile(countrySchema);
