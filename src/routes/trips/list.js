import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const params = {
    // eslint-disable-next-line no-undef
    TableName: process.env.tbl_trips,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await executeQuery("query", params);
    return success(result.Items);
  } catch (e) {
    return failure({ status: false });
  }
}