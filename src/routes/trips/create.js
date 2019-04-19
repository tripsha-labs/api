import uuid from "uuid";
import { success, failure, executeQuery } from "../../libs";

export async function main(event, context) {
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
    await executeQuery("put", params);
    return success(params.Item);
  } catch (e) {
		console.log(e);
    return failure({ status: e });
  }
}