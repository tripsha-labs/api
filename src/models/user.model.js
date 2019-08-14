import _ from 'lodash';
import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem, scanItem } from '../utils';
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
            ':isActive': 1,
          },
        }
      : { ExpressionAttributeValues: { ':isActive': 1 } };
    const expressionAttributeNames = searchText
      ? {
          ExpressionAttributeNames: {
            '#userId': 'userId',
            '#email': 'email',
            '#isActive': 'isActive',
          },
          KeyConditionExpression: '#isActive=:isActive',
          FilterExpression:
            'begins_with(#userId, :userId) or begins_with(#email, :userId)',
        }
      : {
          ExpressionAttributeNames: {
            '#isActive': 'isActive',
          },
          KeyConditionExpression: '#isActive=:isActive',
        };

    const listParams = {
      TableName: this.tableName,
      IndexName: 'SortByUsername',
      ScanIndexForward: true,
      Limit: 500,
      ...expressionAttributeNames,
      ...expressionAttributeValues,
      ...base64Decode(params.nextPageToken),
    };
    return queryItem(listParams);
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
