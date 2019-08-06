/**
 * @name - tagModel
 * @description - All the schema validation for tag handled from here
 */
import Validator from 'fastest-validator';

export const tagSchema = {
  name: { type: 'string', empty: false },
};

export const tagValidation = new Validator().compile(tagSchema);
