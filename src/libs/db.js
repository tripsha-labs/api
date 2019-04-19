import AWS from "aws-sdk";
const cred = {
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'AKIA3VUZDZKTRO2F2D7O',
  secretAccessKey: 'RB4ZX7SW4yCXNZKCe3Ew9NKMfLxTuzw'
};
export function executeQuery(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient(cred);

  return dynamoDb[action](params).promise();
}
