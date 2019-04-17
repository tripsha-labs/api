import uuid from "uuid";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

// {
// 	"tripId": "cc5a7c00-606b-11e9-99d6-41c331582f1a",
// 	"userId": "offlineContext_cognitoIdentityId",
// 	"createdAt": 1555435171776,
// 	"updatedAt": 1555435171776,
// 	"title": "Trip to India",
// 	"members": [],
// 	"startDate": "2019-04-16T17:18:07.997Z",
// 	"endDate": "2019-04-16T17:18:07.997Z",
// 	"description": "description",
// 	"langauges": [
// 			"English"
// 	],
// 	"budgets": [
// 			"$",
// 			"$$"
// 	],
// 	"destinations": [
// 			{
// 					"startDate": "2019-04-16T17:18:07.997Z",
// 					"endDate": "2019-04-16T17:18:07.997Z",
// 					"country": "India",
// 					"address": "add",
// 					"description": "description",
// 					"map_location": "Location",
// 					"pictures": [
// 							{
// 									"url": "url",
// 									"description": "description"
// 							}
// 					]
// 			}
// 	],
// 	"intrests": [
// 			"Film",
// 			"PaniPuri"
// 	],
// 	"status": "upcoming"
// }

export async function main(event, context) {
	// Request body is passed in as a JSON encoded string in 'event.body'
	const data = JSON.parse(event.body);

	const trip = {
		tripId : uuid.v1(),
		userId: event.requestContext.identity.cognitoIdentityId,
		createdAt: Date.now(),
		updatedAt: Date.now()
	}

	if(data.title) trip['title'] = data.title;		
	if(data.members) trip['members'] = data.members;
	if(data.startDate)	trip['startDate'] = data.startDate;
	if(data.endDate)	trip['endDate'] = data.endDate;	
	if(data.description)	trip['description'] = data.description;
	if(data.langauges)	trip['langauges'] = data.langauges;
	if(data.budgets)	trip['budgets'] = data.budgets;
	if(data.destinations)	trip['destinations'] = data.destinations;
	if(data.intrests)	trip['intrests'] = data.intrests;
	if(data.status)	trip['status'] = data.status;
	const params = {
  	TableName : process.env.tbl_trips,
		Item : trip 
	};

	try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
		console.log(e);
    return failure({ status: e });
  }
}