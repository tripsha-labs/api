/**
 * @name - Common
 * @description - All common helpers defined here
 */
import _ from 'lodash';

export const errorSanitizer = error => {
  if (!error.code) return error;
  return [{ type: _.camelCase(error.code), message: error.message }];
};

export const base64Decode = nextPageToken => {
  return nextPageToken
    ? {
        ExclusiveStartKey: JSON.parse(
          Buffer.from(nextPageToken, 'base64').toString('ascii')
        ),
      }
    : {};
};

export const base64Encode = key => {
  return key
    ? {
        nextPageToken: Buffer.from(JSON.stringify(key)).toString('base64'),
      }
    : {};
};
