/**
 * @name - send-message
 * @description - Send Message handler (lambda function)
 */
import * as moment from 'moment';
import uuid from 'uuid';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { success, failure, executeQuery } from '../../utils';
import { errorSanitizer, updateConversation } from '../../helpers';

export const sendMessage = async (event, context) => {
  const postData = JSON.parse(event.body);

  const params = {
    TableName: TABLE_NAMES.MESSAGES,
    Item: {
      groupId: postData.groupId ? postData.groupId : '1',
      toMemberId: postData.toMemberId,
      message: postData.message,
      sentOn: moment().unix(),
      messageType: 'text',
      id: uuid.v1(),
      fromMemberId: event.requestContext.identity.cognitoIdentityId,
    },
  };

  try {
    await executeQuery('put', params);
    await updateConversation(
      params.Item,
      {
        ':userId': params.Item['fromMemberId'],
        ':memberId': params.Item['toMemberId'],
        ':groupId': params.Item['groupId'],
      },
      params.Item['groupId']
    );
    console.info('Message stored!');
    return success(params.Item.id);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
