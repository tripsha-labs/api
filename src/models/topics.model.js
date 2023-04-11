/**
 * @name - Topic model
 * @description - This is the Topic model. All db operations related to Topics are performed from here.
 */
import { Topic, TopicMessage } from './topics.schema';

export class TopicModel extends Topic {}

export class TopicMessageModel extends TopicMessage {}
