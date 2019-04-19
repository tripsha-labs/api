import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const params = {
    TableName: process.env.tbl_users,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const res = await executeQuery("query", params)     
    return success({status: true, data: res});
    
  } catch (e) {
    return failure({ status: false });
  }
}
