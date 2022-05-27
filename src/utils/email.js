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

// Update template - aws ses update-template --cli-input-json file://mytemplate.json
export const sendEmail = data => {
  console.log('Inside email', data);
  const params = {
    Destination: {
      ToAddresses: data.emails,
    },
    Template: 'NotificationTemplate',
    TemplateData: JSON.stringify(data),
    Source: 'Tripsha <notifications@tripsha.com >',
    ReplyToAddresses: ['notifications@tripsha.com '],
  };
  const result = new AWS.SES({ apiVersion: '2010-12-01' })
    .sendTemplatedEmail(params)
    .promise();
  return result;
};
export const sendChatEmail = data => {
  console.log('Inside email', data);
  const params = {
    Destination: {
      ToAddresses: data.emails,
    },
    Template: 'ChatNotificationTemplate',
    TemplateData: JSON.stringify(data),
    Source: 'Tripsha <notifications@tripsha.com >',
    ReplyToAddresses: ['notifications@tripsha.com '],
  };
  const result = new AWS.SES({ apiVersion: '2010-12-01' })
    .sendTemplatedEmail(params)
    .promise();
  return result;
};
export const EmailSender = (
  user,
  { subject, message },
  params,
  isChatNotification = false
) => {
  let emails = [];
  if (user && user.additionalEmails && user.additionalEmails.length > 0) {
    emails = user.additionalEmails.map(em => em.email);
  } else {
    emails = [user['email']];
  }
  if (isChatNotification)
    return sendChatEmail({
      emails: emails,
      name: user['username'],
      subject: subject,
      message: message(...params),
    });
  else
    return sendEmail({
      emails: emails,
      name: user['firstName'],
      subject: subject,
      message: message(...params),
    });
};
