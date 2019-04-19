import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const params = {
    TableName: process.env.tbl_trips,
    Key: {
        userId: event.requestContext.identity.cognitoIdentityId,
        id: event.pathParameters.id
    }
  };

  try {
    const result = await executeQuery("get", params);
    if (result.Item) {
      // Return the retrieved item
      return success(result.Item);
    } else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    return failure({ status: false });
  }
}