/**
 * Mailchimp API utility
 */
import axios from 'axios';
import md5 from 'md5';
const MAILCHIMP_INSTANCE = process.env.MAILCHIMP_INSTANCE;
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_AUDIENCE_LIST_ID = process.env.MAILCHIMP_AUDIENCE_LIST_ID;

export const subscribeUserToMailchimpAudience = async ({
  name,
  email,
  audienceListId = MAILCHIMP_AUDIENCE_LIST_ID,
}) => {
  const params = {
    headers: {
      Authorization: `Basic ${MAILCHIMP_API_KEY}`,
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
  audienceListId = MAILCHIMP_AUDIENCE_LIST_ID,
}) => {
  const params = {
    headers: {
      Authorization: `Basic ${MAILCHIMP_API_KEY}`,
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
