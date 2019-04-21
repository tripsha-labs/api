import { TABLE_NAMES } from '../../constants';
import { success, failure, executeQuery } from '../../utils';
import { createUserValidation, createUserDefaultValues } from '../../models';

export const main = async (event, context) => {
  const data = JSON.parse(event.body);

  // Validate user fields against the strict schema
  const errors = createUserValidation(data);
  if (errors != true) return failure(errors);
  const params = {
    TableName: TABLE_NAMES.USER,
    Item: {
      ...data,
      ...createUserDefaultValues,
      id: event.requestContext.identity.cognitoIdentityId,
    },
  };
  try {
    await executeQuery('put', params);
    return success(params.Item);
  } catch (error) {
    return failure(error);
  }
};
