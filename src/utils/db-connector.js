import AWS from 'aws-sdk';
const cred = {
  region: 'localhost',
  endpoint: '192.168.0.10:8000',
  accessKeyId: 'AKIASX2C4OLA565GJQOW',
  secretAccessKey: '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',
};
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

export const batchGetItem = params => {
  const dynamoDb = new AWS.DynamoDB();
  return dynamoDb.batchGet(params).promise();
};
