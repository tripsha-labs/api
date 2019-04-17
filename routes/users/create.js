import uuid from "uuid";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  
  const params = {
    TableName: process.env.tbl_users,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      username: data.username,
      email: data.email,
      dob: data.dob,
      homeAddress: data.homeAddress,
      gender: data.gender,
      phone: data.phone,
      languagesSpeak: data.languagesSpeak,
      boi: data.boi,
      lookingTravel: data.lookingTravel,
      profilePic: data.profilePic,
      connections: data.connections,
      activityIntrests: data.activityIntrests,
      favoriteSnaps: data.favoriteSnaps,
      identityVerified: data.identityVerified,
      identities: data.identities,
      planDetails: data.planDetails,
      billingAddress: data.billingAddress,
      billingDetails: data.billingDetails,
      countriesIntrests: data.countriesIntrests,
      ratings: data.ratings,
      createdAt: Date.now()
    }
  };

  try {
    const res = await dynamoDbLib.call("put", params);
    return success(res);  
  } catch (e) {
    return failure({ status: false });
  }
}
