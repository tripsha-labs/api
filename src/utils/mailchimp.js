import axios from 'axios';

const MAILCHIMP_INSTANCE = 'us7';
const API_KEY = '1ae2fc7c478057aaf8a7568aedf145b8-us7';
const AUDIENTE_LIST_ID = '885c7a853c';
const MAILCHIMP_URL = `https://${MAILCHIMP_INSTANCE}.api.mailchimp.com/3.0/lists/${AUDIENTE_LIST_ID}`;

export const subscribeUserToMailchimpAudience = async ({ name, email }) => {
  const params = {
    headers: {
      Authorization: `Basic ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  const payload = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: name,
        },
      },
    ],
  };

  try {
    const data = await axios.post(MAILCHIMP_URL, payload, params);
    console.log('Subscribed with success!', data);
  } catch (error) {
    console.log('error mailchimp:', error.message);
  }
};
