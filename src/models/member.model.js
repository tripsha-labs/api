import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem, getItem, deleteItem, updateItem } from '../utils';
import _ from 'lodash';

export class MemberModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.MEMBERS);
  }
  list(params) {
    const memberListParams = {
      TableName: TABLE_NAMES.MEMBERS,
      IndexName: 'tripMembers',
      ScanIndexForward: true,
      Limit: 1000,
      ExpressionAttributeNames: {
        '#tripId': 'tripId',
        '#isMember': 'isMember',
      },
      KeyConditionExpression: '#tripId=:tripId',
      ExpressionAttributeValues: {
        ':tripId': params.tripId,
        ':isMember': true,
      },
      FilterExpression: '#isMember=:isMember',
    };
    return queryItem(memberListParams);
  }

  update(keyParams, item) {
    const params = {
      TableName: this.tableName,
      Key: keyParams,
      UpdateExpression: 'SET ' + queryBuilder(item),
      ExpressionAttributeValues: keyPrefixAlterer(item),
      ReturnValues: 'ALL_NEW',
    };
    return updateItem(params);
  }

  get(keyParams) {
    const params = {
      TableName: this.tableName,
      Key: keyParams,
    };
    return getItem(params);
  }

  delete(keyParams) {
    const params = {
      TableName: this.tableName,
      Key: keyParams,
    };
    return deleteItem(params);
  }
}
