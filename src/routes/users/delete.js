import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const params = {
    TableName: process.env.tbl_users,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    await executeQuery("delete", params);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
}
