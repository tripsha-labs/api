// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region
AWS.config.update({ region: 'us-east-1' });
//  data = {
//     "emails": ["madanesanjayraj@gmail.com"],
//     "name": "Sunita",
//     "subject": "Greetings Sunita",
//     "message": 'The host changed an aspect of Blue Marine. Check the trip page to see the new information and let the host know if they no longer work for you.'
// }
export const sendEmail = data => {
  console.log('Inside email');
  const params = {
    Destination: {
      ToAddresses: data.emails,
    },
    Template: 'NotificationTemplate',
    TemplateData: JSON.stringify(data),
    Source: 'noreply@tripsha.com',
    ReplyToAddresses: ['hello@tripsha.com'],
  };
  const result = new AWS.SES({ apiVersion: '2010-12-01' })
    .sendTemplatedEmail(params)
    .promise();
  return result;
  // result
  //   .then(() => {
  //     console.log("Email sent")
  //     return true;
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     return false;
  //   });
};
