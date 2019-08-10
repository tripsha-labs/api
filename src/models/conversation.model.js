import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem, getItem, deleteItem, updateItem } from '../utils';
import _ from 'lodash';

export class ConversationModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.CONVERSATIONS);
  }

  list(params) {
    const findParam = {
      TableName: TABLE_NAMES.CONVERSATIONS,
      ExpressionAttributeValues: params,
      KeyConditionExpression: 'groupId=:groupId',
      FilterExpression:
        '(toMemberId=:userId and fromMemberId=:memberId) or (toMemberId=:memberId and fromMemberId=:userId)',
    };
    return queryItem(findParam);
  }
}
