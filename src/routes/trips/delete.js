import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const params = {
    // eslint-disable-next-line no-undef
    TableName: process.env.tbl_trips,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      id: event.pathParameters.id
    }
  };

  try {
    // eslint-disable-next-line no-unused-vars
    const result = await executeQuery("delete", params);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
}