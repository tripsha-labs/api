/**
 * @description - Common schema validator defined here,
 * @see - In case if we have large number of schemas then move this code into separate file
 */
import Validator from 'fastest-validator';

const idSchema = {
  id: { type: 'string', empty: false },
};

export const idValidation = new Validator().compile(idSchema);
