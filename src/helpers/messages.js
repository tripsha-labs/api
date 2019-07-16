import { executeQuery } from '../utils';
import { TABLE_NAMES } from '../constants';
import { queryBuilder, keyPrefixAlterer } from '../helpers';

export const updateConversation = async (params, findParams, key) => {
  const findParam = {
    TableName: TABLE_NAMES.CONVERSATIONS,
    ExpressionAttributeValues: findParams,
    KeyConditionExpression: 'groupId=:groupId',
    FilterExpression:
      '(toMemberId=:userId and fromMemberId=:memberId) or (toMemberId=:memberId and fromMemberId=:userId)',
  };
  const updateParams = {
    TableName: TABLE_NAMES.CONVERSATIONS,
  };
  try {
    const conversations = await executeQuery('query', findParam);
    if (
      conversations &&
      conversations.Items &&
      conversations.Items.length > 0
    ) {
      updateParams['Key'] = {
        groupId: key,
      };
      params['id'] = conversations.Items[0].id;
      updateParams['ExpressionAttributeValues'] = keyPrefixAlterer(params);
      updateParams['UpdateExpression'] = 'SET ' + queryBuilder(params);

      updateParams['ConditionExpression'] = 'id=:id';
      return executeQuery('update', updateParams);
    }
  } catch (error) {
    console.log(error);
  }
  updateParams['Item'] = params;
  return executeQuery('put', updateParams);
};
