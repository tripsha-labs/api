import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const params = {
    // eslint-disable-next-line no-undef
    TableName: process.env.tbl_trips,
    // 'KeyConditionExpression' defines the condition for the query
    KeyConditionExpression: "userId = :userId",
    // 'ExpressionAttributeValues' defines the value in the condition
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await executeQuery("query", params);
    // Return the matching list of items in response body
    return success(result.Items);
  } catch (e) {
    return failure({ status: false });
  }
}