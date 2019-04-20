import dynamo from "dynamodb";
import Joi from 'joi';

export const User = dynamo.define('User', {
  hashKey : 'username',
  timestamps : true,
  schema : {
    username : Joi.string()
  }
});

// dynamo.createTables({
//   'User': {readCapacity: 5, writeCapacity: 10}
// }, function(err) {
//   if (err) {
//     console.log('Error creating tables: ', err);
//   } else {
//     console.log('Tables has been created');    
//   }
// });
