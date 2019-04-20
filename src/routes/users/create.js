import { createUserValidation } from "../../models";
import { TABLE_NAMES } from "../../constants";
import { success, failure, executeQuery } from "../../utils";

export const main = async (event, context) => {
  const data = JSON.parse(event.body);
  
  // Validate user fields against the strict schema
  const errors = createUserValidation(data);
  if(errors != true)
    return failure(errors);

  const params = {   
    TableName: TABLE_NAMES.USER,
    Item: {
      ...data,
      id: event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const resCreateUser = await executeQuery("put", params);
    return success(resCreateUser);  
  } catch (error) {
    return failure(error);
  }  
};