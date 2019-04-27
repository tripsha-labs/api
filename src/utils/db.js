/**
 * @name - db
 * @description - Dynamodb connection handled here
 */
import AWS from 'aws-sdk';

export const executeQuery = (action, params) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
};

export const batchQuery = (action, params) => {
  const dynamoDb = new AWS.DynamoDB();

  return dynamoDb[action](params).promise();
};
