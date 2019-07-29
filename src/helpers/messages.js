import { executeQuery } from '../utils';
import { TABLE_NAMES } from '../constants';

export const updateConversation = async (params, findParams, key) => {
  const findParam = {
    TableName: TABLE_NAMES.CONVERSATIONS,
    ExpressionAttributeValues: findParams,
    KeyConditionExpression: 'groupId=:groupId',
    FilterExpression:
      '(toMemberId=:userId and fromMemberId=:memberId) or (toMemberId=:memberId and fromMemberId=:userId)',
  };

  try {
    const conversations = await executeQuery('query', findParam);
    if (
      !(conversations && conversations.Items && conversations.Items.length > 0)
    ) {
      const createParams = {
        TableName: TABLE_NAMES.CONVERSATIONS,
        Item: params,
      };
      return executeQuery('put', createParams);
    }
  } catch (error) {
    console.log(error);
  }
};
