import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const params = {
    // eslint-disable-next-line no-undef
    TableName: process.env.tbl_users,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    await executeQuery("delete", params);
    return success("success");
  } catch (e) {
    return failure(e);
  }
}
