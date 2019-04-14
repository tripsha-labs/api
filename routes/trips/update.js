import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";


export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
		TableName : process.env.tbl_trips,
		 // 'Key' defines the partition key and sort key of the item to be updated
         Key: {
            owner: event.requestContext.identity.cognitoIdentityId,
            id: event.pathParameters.id
            },   
		// 'UpdateExpression' defines the attributes to be updated
		UpdateExpression : "SET date = :date, numberOfDays = :numberOfDays, budget = :budget, status = :status, description = :description, destinations = :destinations,  name = :name, matchCriteria = :matchCriteria, tripshers = :tripshers, interactions = :interactions ",
		// 'ExpressionAttributeValues' defines the value in the update expression
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
		// 'ReturnValues' specifies if and how to return the item's attributes,
        // where ALL_NEW returns all attributes of the item after the update
        ReturnValues: "ALL_NEW"
		};
	
	
 try {
    const result = await dynamoDbLib.call("update", params);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
};