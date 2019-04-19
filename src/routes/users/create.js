import { User } from "../../models";
import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const data = JSON.parse(event.body);   
  const errors = User(data);
  if(errors != true)
    return failure(errors);
  
  data["userId"] = event.requestContext.identity.cognitoIdentityId;
  
  const params = {
    // eslint-disable-next-line no-undef
    TableName: process.env.tbl_users,
    Item: data
  };

  try {
    const res = await executeQuery("put", params);
    return success(res);  
  } catch (e) {
    return failure(e);
  }  
}
