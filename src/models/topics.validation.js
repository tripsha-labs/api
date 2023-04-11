/**
 * @name - Topic validator
 * @description - The Topic schema validator.
 */
import Validator from 'fastest-validator';

const createTopicSchema = {
  tripId: { type: 'string', empty: false },
  title: { type: 'string', empty: false },
  type: { type: 'string', empty: false },
  topicId: { type: 'string', optional: true },
  overview: { type: 'string', optional: true },
  $$strict: 'remove',
};

export const createTopicValidation = new Validator().compile(createTopicSchema);

const editTopicSchema = {
  title: { type: 'string', empty: false, optional: true },
  overview: { type: 'string', optional: true },
  attachments: { type: 'array', optional: true },
  links: { type: 'array', optional: true },
  status: { type: 'string', optional: true },
  $$strict: 'remove',
};

export const editTopicValidation = new Validator().compile(editTopicSchema);

const editMessageSchema = {
  message: { type: 'string', empty: false, optional: true },
  pinned: { type: 'boolean', optional: true },
  $$strict: 'remove',
};

export const editTopicMessageValidation = new Validator().compile(
  editMessageSchema
);

const createMessageSchema = {
  tripId: { type: 'string', empty: false },
  topicId: { type: 'string', empty: false },
  ...editMessageSchema,
};

export const createTopicMessageValidation = new Validator().compile(
  createMessageSchema
);
