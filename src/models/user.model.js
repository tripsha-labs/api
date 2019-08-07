import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem, scanItem } from '../utils';
import _ from 'lodash';
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
    // Build nextpage token
    const exclusiveStartKey = params.nextPageToken
      ? {
          ExclusiveStartKey: JSON.parse(
            Buffer.from(params.nextPageToken, 'base64').toString('ascii')
          ),
        }
      : {};
    const listParams = {
      TableName: this.tableName,
      IndexName: 'SortByUsername',
      ScanIndexForward: true,
      Limit: 500,
      ...expressionAttributeNames,
      ...expressionAttributeValues,
      ...exclusiveStartKey,
    };
    console.log(listParams);
    return queryItem(listParams);
  }

  isExists(userId) {
    const params = {
      TableName: this.tableName,
      FilterExpression: 'userId=:userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    return scanItem(params);
  }
}
