let Validator = require("fastest-validator");
import { success, failure, executeQuery } from "../../libs";
// import {createUser} from '../../models';

export async function main(event, context) {
  const data = JSON.parse(event.body);
  // try{
    let v = new Validator();
    const schema = {
      id: { type: "number", positive: true, integer: true },
      name: { type: "string", min: 3, max: 255, optional: true },
      status: "boolean", // short-hand def
      roles: { type: "array", empty: false, items: "string", enum: [ "user", "admin" ] },
      $$strict: true
  };
   
    const errors = v.validate(data, schema);
  
    return failure(errors); 
  // } catch(err){
  //   return failure({ status: false, errors: err });
  // }
  // const params = {
  //   TableName: process.env.tbl_users,
  //   Item: {
  //     userId: event.requestContext.identity.cognitoIdentityId,
  //     username: data.username,
  //     email: data.email,
  //     dob: data.dob,
  //     homeAddress: data.homeAddress,
  //     gender: data.gender,
  //     phone: data.phone,
  //     languagesSpeak: data.languagesSpeak,
  //     boi: data.boi,
  //     lookingTravel: data.lookingTravel,
  //     profilePic: data.profilePic,
  //     connections: data.connections,
  //     activityIntrests: data.activityIntrests,
  //     favoriteSnaps: data.favoriteSnaps,
  //     identityVerified: data.identityVerified,
  //     identities: data.identities,
  //     planDetails: data.planDetails,
  //     billingAddress: data.billingAddress,
  //     billingDetails: data.billingDetails,
  //     countriesIntrests: data.countriesIntrests,
  //     ratings: data.ratings,
  //     createdAt: Date.now()
  //   }
  // };

  // try {
  //   const res = await executeQuery("put", params);
  //   return success(res);  
  // } catch (e) {
  //   return failure({ status: false });
  // }
}
