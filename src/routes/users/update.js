import { success, failure, executeQuery } from "../../utils";
import { TABLE_NAMES } from "../../constants";

export const main = async (event, context) => {
  const data = JSON.parse(event.body);
  const params = {    
    TableName: TABLE_NAMES.USER,
    Key: {
      id: event.requestContext.identity.cognitoIdentityId
    },
    UpdateExpression: "SET content = :username",
    ExpressionAttributeValues: {
      ":username": data.username || null
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const resUpdateUser = await executeQuery("update", params);
    return success(resUpdateUser.Item);
  } catch (error) {
    return failure(error);
  }
}
