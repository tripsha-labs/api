import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem } from '../utils';
import { base64Decode } from '../helpers';

export class ConversationModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.CONVERSATIONS);
  }

  list(params) {
    const queryParams = {
      TableName: this.tableName,
      ExpressionAttributeValues: {
        ':userId': params ? params.userId : '',
        ':groupId': params && params.groupId ? params.groupId : '1',
      },
      KeyConditionExpression: 'groupId=:groupId',
      FilterExpression: 'toMemberId=:userId or fromMemberId=:userId',
      ScanIndexForward: true,
      Limit: 5000,
      ...base64Decode(params.nextPageToken),
    };
    return queryItem(queryParams);
  }
}
