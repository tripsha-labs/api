import { dbConnect, EmailSender } from '../../utils';
import { EmailMessages } from '../../constants';
import { MessageModel } from '../../models';

export const send = async (event, context) => {
  try {
    await dbConnect();
    const query = [
      {
        $match: {
          // isRead: false,
          messageType: { $ne: 'info' },
          createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: '$toMemberId',
          messages: {
            $first: '$$ROOT',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$messages',
        },
      },
      {
        $project: {
          toMemberId: { $toObjectId: '$toMemberId' },
          fromMemberId: { $toObjectId: '$fromMemberId' },
          messageType: 1,
          mediaUrl: 1,
          isGroupMessage: 1,
          message: 1,
          createdAt: 1,
          tripId: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'toMemberId',
          foreignField: '_id',
          as: 'toUser',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'fromMemberId',
          foreignField: '_id',
          as: 'fromUser',
        },
      },
      {
        $unwind: {
          path: '$toUser',
        },
      },
      {
        $unwind: {
          path: '$fromUser',
        },
      },
    ];
    console.log(query);
    const messages = await MessageModel.aggregate(query);
    console.log(messages.length);
    if (messages && messages.length > 0) {
      messages.map(async message => {
        await EmailSender(
          message.toUser,
          EmailMessages.NEW_CHAT_MESSAGE,
          [message.message],
          true
        );
      });
    }
    return context.logStreamName;
  } catch (err) {
    console.log(err);
  }
};
