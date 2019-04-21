import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';

export const main = async (event, context) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      id: event.pathParameters.id,
    },
    UpdateExpression:
      'SET date = :date, numberOfDays = :numberOfDays, budget = :budget, status = :status, description = :description, destinations = :destinations,  name = :name, matchCriteria = :matchCriteria, tripshers = :tripshers, interactions = :interactions ',

    ExpressionAttributeValues: {
      ':date': data.date || null,
      ':numberOfDays': data.numberOfDays || null,
      ':budget': data.budget || null,
      ':status': data.status || null,
      ':description': data.description || null,
      destinations: data.destinations || null,
      ':name': data.name || null,
      matchCriteria: data.matchCriteria || null,
      tripshers: data.tripshers || null,
      interactions: data.interactions || null,
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    await executeQuery('update', params);
    return success('success');
  } catch (error) {
    return failure(error);
  }
};
