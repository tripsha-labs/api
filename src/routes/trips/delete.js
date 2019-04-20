import { success, failure, executeQuery } from "../../utils";
import { TABLE_NAMES } from "../../constants";

export const main = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      id: event.pathParameters.id
    }
  };

  try {
    await executeQuery("delete", params);
    return success("success");
  } catch (error) {
    return failure(error);
  }
}