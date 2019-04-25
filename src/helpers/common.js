/**
 * @name - Common
 * @description - All common helpers defined here
 */
export const errorSanitizer = error => {
  try {
    return [{ type: error.code, message: error.message }];
  } catch (error) {
    return error;
  }
};
