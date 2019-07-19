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

export const getUserByUserID = id => {
  const params = {
    TableName: TABLE_NAMES.USER,
    FilterExpression: 'userId=:userId',
    ExpressionAttributeValues: {
      ':userId': id,
    },
  };
  return executeQuery('scan', params);
};
