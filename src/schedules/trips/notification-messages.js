import { NotificationsModel } from '../../models';
import { dbConnect } from '../../utils';
import Airtable from 'airtable';

export const loadMessages = async (event, context) => {
  try {
    await dbConnect();
    const airtable = new Airtable({
      apiKey: process.env.AIRTABLE_TOKEN,
    }).base('appNt0BwHBkRcjrQq');

    const records = await airtable('Notifications')
      .select({
        view: 'Grid view',
      })
      .firstPage();

    const messages = records?.map(record => {
      if (!record.fields?.id) {
        return;
      }
      const filter = { id: record.fields?.id };
      return {
        updateOne: {
          filter: filter,
          update: {
            $set: record.fields,
          },
          upsert: true,
        },
      };
    });
    const payload = messages.filter(record => record);
    await NotificationsModel.bulkWrite(payload);
    return context.logStreamName;
  } catch (err) {
    console.log(err);
  }
};
