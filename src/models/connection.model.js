import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem, getItem, deleteItem, updateItem, scanItem } from '../utils';
import _ from 'lodash';

export class ConnectionModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.CONNECTIONS);
  }

  get(connectionId) {
    const params = {
      TableName: this.tableName,
      Key: { connectionId },
    };
    return getItem(params);
  }

  list(toMemberId) {
    const params = {
      TableName: this.tableName,
      ProjectionExpression: 'connectionId',
      ExpressionAttributeValues: {
        ':userId': toMemberId,
      },
      FilterExpression: 'userId=:userId',
    };

    return scanItem(params);
  }
}
