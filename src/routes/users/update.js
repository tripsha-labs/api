import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tbl_users,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId
    },

    UpdateExpression: "SET content = :username",
    ExpressionAttributeValues: {
      ":username": data.username || null
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await executeQuery("update", params);
    return success({ status: true, result: result.Item});
  } catch (e) {
    return failure({ status: false });
  }
}
