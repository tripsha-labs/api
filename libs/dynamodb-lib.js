import AWS from "aws-sdk";
const cred = {
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'AKIA3VUZDZKTRO2F2D7O',  // needed if you don't have aws credentials at all in env
  secretAccessKey: 'RB4ZX7SW4yCXNZKCe3Ew9NKMfLxTuzw' // needed if you don't have aws credentials at all in env
};
export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}
