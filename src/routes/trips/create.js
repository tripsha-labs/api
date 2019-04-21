import uuid from 'uuid';
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';

export const main = async (event, context) => {
  const data = JSON.parse(event.body);

  const trip = {
    id: uuid.v1(),
    userId: event.requestContext.identity.cognitoIdentityId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (data.title) trip['title'] = data.title;
  if (data.members) trip['members'] = data.members;
  if (data.startDate) trip['startDate'] = data.startDate;
  if (data.endDate) trip['endDate'] = data.endDate;
  if (data.description) trip['description'] = data.description;
  if (data.langauges) trip['langauges'] = data.langauges;
  if (data.budgets) trip['budgets'] = data.budgets;
  if (data.destinations) trip['destinations'] = data.destinations;
  if (data.interests) trip['interests'] = data.interests;
  if (data.status) trip['status'] = data.status;

  const params = {
    TableName: TABLE_NAMES.TRIP,
    Item: trip,
  };

  try {
    const resCreateTrip = await executeQuery('put', params);
    return success(resCreateTrip.Item);
  } catch (error) {
    return failure(error);
  }
};
