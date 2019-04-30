/**
 * @name - db
 * @description - Dynamodb connection handled here
 */
import AWS from 'aws-sdk';
// const cred = {
//   region: 'localhost',
//   endpoint: 'http://localhost:8000',
//   accessKeyId: 'AKIASX2C4OLAQDRG23OP',
//   secretAccessKey: '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',
// };
export const executeQuery = (action, params) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
};

export const batchQuery = (action, params) => {
  const dynamoDb = new AWS.DynamoDB();

  return dynamoDb[action](params).promise();
};
