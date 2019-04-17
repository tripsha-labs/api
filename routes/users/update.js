import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tbl_users,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId
    },

    UpdateExpression: "SET content = :username",
    ExpressionAttributeValues: {
      ":username": data.username || null
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    return success({ status: true, result: result.Item});
  } catch (e) {
    return failure({ status: false });
  }
}
