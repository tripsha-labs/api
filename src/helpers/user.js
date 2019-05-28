import { executeQuery } from '../utils';
import { TABLE_NAMES } from '../constants';

export const getUserById = id => {
  const params = {
    TableName: TABLE_NAMES.USER,
    Key: {
      id: id,
    },
  };

  return executeQuery('get', params);
};
