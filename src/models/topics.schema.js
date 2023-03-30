/**
 * @name - Topics schema
 * @description - This is the mongoose Topics schema.
 */
import mongoose, { Schema } from 'mongoose';

const TopicSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', index: true },
    type: { type: String, default: 'topic' },
    title: { type: String },
    status: { type: String, default: 'TODO' },
    overview: { type: String },
    attachments: { type: Array, default: [] },
    links: { type: Array, default: [] },
    pinnedMessages: { type: Array, default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Topic =
  mongoose.models.Topic || mongoose.model('Topic', TopicSchema);

const TopicMessageSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', index: true },
    message: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const TopicMessage =
  mongoose.models.TopicMessage ||
  mongoose.model('TopicMessage', TopicMessageSchema);
