import { apigwManagementApi } from '../../utils';
import { TABLE_NAMES } from '../../constants';

export const connectionHandler = async (event, context) => {
  if (event.requestContext.eventType === 'CONNECT') {
    // Handle connection
    try {
      await addConnection(event.requestContext.connectionId);
      return {
        statusCode: 200,
        body: 'everything is alright',
      };
    } catch (err) {
      JSON.stringify(err);
      return err;
    }
  } else if (event.requestContext.eventType === 'DISCONNECT') {
    // Handle disconnection
    try {
      await deleteConnection(event.requestContext.connectionId);
      return {
        statusCode: 200,
        body: 'everything is alright',
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: 'Failed to connect: ' + JSON.stringify(err),
      };
    }
  }
};

// THIS ONE DOESNT DO ANYHTING
export const defaultHandler = async (event, context) => {
  console.log('defaultHandler was called');
  console.log(event);
  s;
  return {
    statusCode: 200,
    body: 'defaultHandler',
  };
};

export const sendMessageHandler = async (event, context, callback) => {
  try {
    await sendMessageToAllConnected(event);
    return {
      statusCode: 200,
      body: 'everything is alright',
    };
  } catch (err) {
    return err;
  }
};

const sendMessageToAllConnected = event => {
  return getConnectionIds().then(connectionData => {
    return connectionData.Items.map(connectionId => {
      return send(event, connectionId.connectionId);
    });
  });
};

const getConnectionIds = async () => {
  const params = {
    TableName: TABLE_NAMES.CONNECTIONS,
    ProjectionExpression: 'id',
  };
  try {
    return await executeQuery('scan', params);
  } catch (error) {
    return error;
  }
};

const send = (event, connectionId) => {
  const body = JSON.parse(event.body);
  const postData = body.data;

  const endpoint =
    event.requestContext.domainName + '/' + event.requestContext.stage;
  const params = {
    ConnectionId: connectionId,
    Data: postData,
  };
  return apigwManagementApi(endpoint)
    .postToConnection(params)
    .promise();
};

const addConnection = async connectionId => {
  const params = {
    TableName: TABLE_NAMES.CONNECTIONS,
    Item: {
      connectionId: connectionId,
    },
  };
  try {
    return await executeQuery('put', params);
  } catch (error) {
    return error;
  }
};

const deleteConnection = async connectionId => {
  const params = {
    TableName: TABLE_NAMES.CONNECTIONS,
    Key: {
      connectionId: connectionId,
    },
  };
  try {
    return await executeQuery('delete', params);
  } catch (error) {
    return error;
  }
};
