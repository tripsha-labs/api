import AWS from 'aws-sdk';
const dynamo = new AWS.DynamoDB.DocumentClient();

export const saveItem = params => {
  return dynamo.put(params).promise();
};

export const updateItem = params => {
  return dynamo.update(params).promise();
};

export const getItem = params => {
  return dynamo.get(params).promise();
};

export const deleteItem = params => {
  return dynamo.delete(params).promise();
};

export const scanItem = params => {
  return dynamo.scan(params).promise();
};

export const queryItem = params => {
  return dynamo.query(params).promise();
};
