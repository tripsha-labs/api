import { success, failure, executeQuery } from "../../utils";
import { TABLE_NAMES } from "../../constants";

export const main = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.USER,
    Key: {
      id: event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await executeQuery("get", params);
    if (result.Item) {   
      return success(result.Item);
    } else {
      return failure("Item not found.");
    }
  } catch (error) {
    return failure(error);
  }
}
