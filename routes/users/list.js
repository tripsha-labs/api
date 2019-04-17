import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.tbl_users,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const res = await dynamoDbLib.call("query", params)     
    return success({status: true, data: res});
    
  } catch (e) {
    return failure({ status: false });
  }
}
