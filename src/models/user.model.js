import _ from 'lodash';
import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { scanItem } from '../utils';
import { base64Decode } from '../helpers';

export class UserModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.USER);
  }

  list(params = {}) {
    const searchText = params.searchText;
    // Build attribute values
    const expressionAttributeValues = searchText
      ? {
          ExpressionAttributeValues: {
            ':userId': _.lowerCase(searchText),
          },
        }
      : {};
    const expressionAttributeNames = searchText
      ? {
          ExpressionAttributeNames: {
            '#userId': 'userId',
            '#email': 'email',
          },

          FilterExpression:
            'begins_with(#userId, :userId) or begins_with(#email, :userId)',
        }
      : {};

    const listParams = {
      TableName: this.tableName,
      Limit: 500,
      ...expressionAttributeNames,
      ...expressionAttributeValues,
      ...base64Decode(params.nextPageToken),
    };

    return scanItem(listParams);
  }

  isExists(userId, id) {
    const params = {
      TableName: this.tableName,
      FilterExpression: 'userId=:userId and id<>:id',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':id': id,
      },
    };

    return scanItem(params);
  }

  getUserByUsername(username) {
    const params = {
      TableName: TABLE_NAMES.USER,
      ExpressionAttributeValues: {
        ':username': username,
      },
      FilterExpression: 'username=:username',
    };
    return scanItem(params);
  }
}
