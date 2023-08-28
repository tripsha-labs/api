/**
 * @name - Common
 * @description - All common helpers defined here
 */
import _ from 'lodash';
import { APP_CONSTANTS } from '../constants';

export const errorSanitizer = (error: any) => {
  if (!error.code) return error;
  return [{ type: _.camelCase(error.code), message: error.message }];
};

export const prepareCommonFilter = (params: any, allowedFields = []) => {
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
    // @ts-ignore
    filter['sort'] = { [params.sortBy]: sortOrder };
  }
  return filter;
};

export const prepareCommonPagination = (params: any) => {
  const limit = params.limit ? parseInt(params.limit) : APP_CONSTANTS.LIMIT;
  const page = params.page ? parseInt(params.page) : APP_CONSTANTS.PAGE;
  const pagination = [];
  pagination.push({ $skip: limit * page });
  pagination.push({ $limit: limit });
  return pagination;
};

/**
 * This will prepare a sort object for mongodb query
 */
export const prepareSortFilter = (
  params: any,
  allowedFields = [],
  defaultSort: any,
  defaultSortOrder = 1
) => {
  const sortOrder = params.sortOrder
    ? parseInt(params.sortOrder)
    : defaultSortOrder;
  if (params.sortBy && _.indexOf(allowedFields, params.sortBy) != -1) {
    return { [params.sortBy]: sortOrder };
  }
  return { [defaultSort]: sortOrder };
};

/**
 * This will generate a 3 digit random number
 */
export const generateRandomNumber = () => {
  return Math.floor(Math.random() * (999 - 100 + 1) + 100);
};
