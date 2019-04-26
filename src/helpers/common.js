/**
 * @name - Common
 * @description - All common helpers defined here
 */
import _ from 'lodash';

export const errorSanitizer = error => {
  try {
    return [{ type: _.camelCase(error.code), message: error.message }];
  } catch (error) {
    return error;
  }
};
