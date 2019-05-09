import { TABLE_NAMES } from '../constants';
export const addCountryTags = tags => {
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Item: {
      ...data, // validated data
      ...createTripDefaultValues, // default values
      userId: event.requestContext.identity.cognitoIdentityId,
      id: uuid.v1(),
    },
    ReturnValues: 'ALL_OLD',
  };
};
