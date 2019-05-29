import {
  success,
  failure,
  executeQuery,
  apigwManagementApi,
} from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';

export const connectionHandler = async (event, context) => {
  try {
    if (event.requestContext.eventType === 'CONNECT') {
      await addConnection(event.requestContext.connectionId);
    } else if (event.requestContext.eventType === 'DISCONNECT') {
      await deleteConnection(event.requestContext.connectionId);
    }
    return success({
      data: 'success',
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

// THIS ONE DOESNT DO ANYHTING
export const defaultHandler = async (event, context) => {
  return success({
    data: 'Default Handler',
  });
};

export const sendMessageHandler = async (event, context) => {
  try {
    await sendMessageToAllConnected(event);
    return success({
      data: 'success',
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

const sendMessageToAllConnected = event => {
  return getConnectionIds().then(connectionData => {
    return connectionData.Items.map(connectionId => {
      return send(event, connectionId.connectionId);
    });
  });
};

const getConnectionIds = () => {
  const params = {
    TableName: TABLE_NAMES.CONNECTIONS,
    ProjectionExpression: 'connectionId',
  };

  return executeQuery('scan', params);
};

const send = (event, connectionId) => {
  const body = JSON.parse(event.body);
  const postData = body.data;

  const endpoint =
    event.requestContext.domainName + '/' + event.requestContext.stage;
  const apigwManagement = apigwManagementApi(endpoint);

  const params = {
    ConnectionId: connectionId,
    Data: postData,
  };
  return apigwManagement.postToConnection(params).promise();
};

const addConnection = connectionId => {
  const params = {
    TableName: TABLE_NAMES.CONNECTIONS,
    Item: {
      connectionId: connectionId,
    },
  };

  return executeQuery('put', params);
};

const deleteConnection = connectionId => {
  const params = {
    TableName: TABLE_NAMES.CONNECTIONS,
    Key: {
      connectionId: connectionId,
    },
  };

  return executeQuery('delete', params);
};
