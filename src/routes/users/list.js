import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const params = {
    // eslint-disable-next-line no-undef
    TableName: process.env.tbl_users,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const res = await executeQuery("query", params)     
    return success(res);    
  } catch (e) {
    print(e)
    return failure(r);
  }
}
