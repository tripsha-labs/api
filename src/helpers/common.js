/**
 * @name - Common
 * @description - All common helpers defined here
 */
import _ from 'lodash';

export const errorSanitizer = error => {
  try {
    if (!error.code) return error;
    return [{ type: _.camelCase(error.code), message: error.message }];
  } catch (error) {
    return error;
  }
};
