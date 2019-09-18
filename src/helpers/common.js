/**
 * @name - Common
 * @description - All common helpers defined here
 */
import _ from 'lodash';
import { APP_CONSTANTS } from '../constants';

export const errorSanitizer = error => {
  if (!error.code) return error;
  return [{ type: _.camelCase(error.code), message: error.message }];
};

export const prepareCommonFilter = (params, allowedFields = []) => {
  const limit = params.limit ? parseInt(params.limit) : APP_CONSTANTS.LIMIT;
  const page = params.page ? parseInt(params.page) : APP_CONSTANTS.PAGE;

  const filter = {
    pagination: {
      limit: limit,
      skip: limit * page,
    },
  };
  if (params.sortBy && _.indexOf(allowedFields, params.sortBy) != -1) {
    const sortOrder = params.sortOrder ? params.sortOrder : 1;
    filter['sort'] = { [params.sortBy]: sortOrder };
  }
  return filter;
};

/**
 * This will prepare sort object for mongodb query
 */
export const prepareSortFilter = (
  params,
  allowedFields = [],
  defaultSort,
  defaultSortOrder = 1
) => {
  if (params.sortBy && _.indexOf(allowedFields, params.sortBy) != -1) {
    const sortOrder = params.sortOrder ? parseInt(params.sortOrder) : 1;
    return { [params.sortBy]: sortOrder };
  }
  return { [defaultSort]: defaultSortOrder };
};

/**
 * This will generate 3 digit random number
 */
export const generateRandomNumber = () => {
  return Math.floor(Math.random() * (999 - 100 + 1) + 100);
};
