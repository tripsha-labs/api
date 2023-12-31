import { USER_BASIC_INFO } from '../../constants';
import { TopicModel, TopicMessageModel } from '../../models';

export class TopicController {
  static async listTopics(tripId) {
    const topics = await TopicModel.aggregate([
      {
        $match: {
          tripId: tripId,
          type: 'topic',
        },
      },
      {
        $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: 'topicId',
          as: 'subTopics',
        },
      },
    ]);
    return topics;
  }
  static async createTopic(payload) {
    await TopicModel.create(payload);
    return 'success';
  }
  static async updateTopic(topicId, payload) {
    await TopicModel.updateOne({ _id: topicId }, { $set: payload });
    return 'success';
  }
  static async deleteTopic(topicId) {
    const topic = await TopicModel.findByIdAndDelete(topicId);
    if (topic._id) {
      await TopicModel.deleteMany({ topicId: topic._id });
      await TopicMessageModel.deleteMany({ topicId: topic._id });
    }
    return 'success';
  }
  static async listMessages(topicId) {
    const topics = await TopicMessageModel.aggregate([
      {
        $match: {
          topicId: topicId,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'User',
          pipeline: [
            {
              $project: USER_BASIC_INFO,
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$User',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    return topics;
  }
  static async createMessage(payload) {
    await TopicMessageModel.create(payload);
    return 'success';
  }
  static async updateMessage(messageId, payload) {
    payload['edited'] = true;
    await TopicMessageModel.updateOne({ _id: messageId }, { $set: payload });
    return 'success';
  }
  static async deleteMessage(messageId) {
    await TopicMessageModel.deleteOne({ _id: messageId });
    return 'success';
  }
  static async addDefaultTopics(tripId, userId) {
    const topics = [
      { title: 'Accommodation' },
      { title: 'Flights' },
      { title: 'Ground transport' },
      { title: 'Activities' },
      { title: 'Food & Beverage' },
      { title: 'Meeting/Work Space' },
      { title: 'Technology' },
      { title: 'Attendees & Guests' },
      { title: 'Swag' },
      { title: 'Travel Insurance' },
    ];
    const topicsPayload = topics.map(t => {
      t['tripId'] = tripId;
      t['updatedBy'] = userId;
      t['createdBy'] = userId;
      return t;
    });
    await TopicModel.insertMany(topicsPayload);
  }
}
