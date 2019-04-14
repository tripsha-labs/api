import uuid from "uuid";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
	// Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  const params = {
  	TableName : process.env.tbl_trips,
		Item : {	    // 'Item' contains the attributes of the item to be created
			id : uuid.v1(),
			userId: event.requestContext.identity.cognitoIdentityId,
			owner : data.owner,
			date : data.date,
			numberOfDays: data.numberOfDays,
			budget :data.budget,
			status: data.status,
			description : data.description,
			destinations : data.destinations,
			name : data.name,
			matchCriteria : data.matchCriteria,
			tripshers : data.tripshers,
      interactions : data.interactions,
      createdAt: Date.now()
		}		
	};

	try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}