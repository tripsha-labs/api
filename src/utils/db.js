import AWS from "aws-sdk";
const cred = {
  region: "localhost",
  endpoint: "http://localhost:8000",
  accessKeyId: "AKIA3VUZDZKTRO2F2D7O",
  secretAccessKey: "RB4ZX7SW4yCXNZKCe3Ew9NKMfLxTuzw"
};

// import dynamo from "dynamodb";
// const dynamodb = new AWS.DynamoDB(cred);
// dynamo.dynamoDriver(dynamodb);

export const executeQuery = (action, params) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient(cred);

  return dynamoDb[action](params).promise();
}

// dynamo.createTables({
//   'User': {readCapacity: 5, writeCapacity: 10}
// }, (err) => {
//   if (err) {
//     console.log('Error creating tables: ', err);
//   } else {
//     console.log('Tables has been created');
//   }
// });
