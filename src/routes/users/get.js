import { success, failure, executeQuery } from "../../libs";


export async function main(event, context) {
  const params = {
    TableName: process.env.tbl_users,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await executeQuery("get", params);
    if (result.Item) {   
      return success(result.Item);
    } else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    return failure({ status: false });
  }
}
