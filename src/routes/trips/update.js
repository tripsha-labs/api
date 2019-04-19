import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    // eslint-disable-next-line no-undef
    TableName : process.env.tbl_trips,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      id: event.pathParameters.id
    },   
    UpdateExpression : "SET date = :date, numberOfDays = :numberOfDays, budget = :budget, status = :status, description = :description, destinations = :destinations,  name = :name, matchCriteria = :matchCriteria, tripshers = :tripshers, interactions = :interactions ",

    ExpressionAttributeValues : {
      ":date" : data.date || null,
      ":numberOfDays": data.numberOfDays || null,
      ":budget" : data.budget || null,
      ":status": data.status || null,
      ":description" : data.description || null,
      "destinations" : data.destinations || null,
      ":name" : data.name || null,
      "matchCriteria" : data.matchCriteria || null,
      "tripshers" : data.tripshers || null,
      "interactions" : data.interactions || null,
    },
    ReturnValues: "ALL_NEW"
  };	
	
  try {
    await executeQuery("update", params);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
};