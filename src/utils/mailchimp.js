/**
 * Mailchimp API utility
 */
import axios from 'axios';
import md5 from 'md5';
const MAILCHIMP_INSTANCE = 'us7';
const API_KEY = '1ae2fc7c478057aaf8a7568aedf145b8-us7';
const AUDIENCE_LIST_ID = '885c7a853c';

export const subscribeUserToMailchimpAudience = async ({
  name,
  email,
  audienceListId = AUDIENCE_LIST_ID,
}) => {
  const params = {
    headers: {
      Authorization: `Basic ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  const payload = {
    update_existing: true,
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
  const MAILCHIMP_URL = `https://${MAILCHIMP_INSTANCE}.api.mailchimp.com/3.0/lists/${audienceListId}`;
  try {
    const data = await axios.post(MAILCHIMP_URL, payload, params);
    console.log('Subscribed with success!', data.data);
  } catch (error) {
    console.log('error mailchimp:', error.message);
  }
};

export const unsubscribeUserToMailchimpAudience = async ({
  name,
  email,
  audienceListId = AUDIENCE_LIST_ID,
}) => {
  const params = {
    headers: {
      Authorization: `Basic ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  email = md5(email.toLowerCase());

  const payload = {
    status: 'unsubscribed',
  };
  const MAILCHIMP_URL = `https://${MAILCHIMP_INSTANCE}.api.mailchimp.com/3.0/lists/${audienceListId}/members/${email}`;
  try {
    const data = await axios.patch(MAILCHIMP_URL, payload, params);
    console.log('Subscribed with success!', data.data);
  } catch (error) {
    console.log('error mailchimp:', error.message);
  }
};
