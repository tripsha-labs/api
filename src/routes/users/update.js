import { success, failure, executeQuery } from "../../utils";
import { TABLE_NAMES } from "../../constants";
import { updateUserValidation, updateUserDefaultValues } from "../../models";
import { queryBuilder, keyPrefixAlterer } from "../../helpers";

export const main = async (event, context) => {
  const data = JSON.parse(event.body);

  // Validate user fields against the strict schema
  const errors = updateUserValidation(data);
  if(errors != true)
    return failure(errors);
  data = {...data, ...updateUserDefaultValues};
  const params = {    
    TableName: TABLE_NAMES.USER,
    Key: {
      id: event.requestContext.identity.cognitoIdentityId
    },
    UpdateExpression: "SET " + queryBuilder(data),
    ExpressionAttributeValues: keyPrefixAlterer(data),
    ReturnValues: "ALL_NEW"
  };

  try {
    const resUpdateUser = await executeQuery("update", params);
    return success(resUpdateUser.Item);
  } catch (error) {
    return failure([error]);
  }
}
