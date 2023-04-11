/**
 * @name - Topics handlar
 * @description - This will handle all topic related API requests
 */
import { TopicController } from './topic.ctrl';
import { successResponse, failureResponse } from '../../utils';
import {
  createTopicMessageValidation,
  createTopicValidation,
  editTopicValidation,
  editTopicMessageValidation,
} from '../../models';
import { Types } from 'mongoose';

export const listTopics = async (req, res) => {
  try {
    const payload = req.query || {};
    if (!(payload && payload.tripId))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const result = await TopicController.listTopics(
      Types.ObjectId(payload.tripId)
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const createTopic = async (req, res) => {
  try {
    const payload = req.body || {};
    const errors = createTopicValidation(payload);
    if (errors != true) throw errors.shift();
    if (payload.hasOwnProperty('tripId'))
      payload['tripId'] = Types.ObjectId(payload['tripId']);
    if (payload.hasOwnProperty('topicId'))
      payload['topicId'] = Types.ObjectId(payload['topicId']);
    payload['createdBy'] = req.currentUser._id;
    payload['updatedBy'] = req.currentUser._id;
    const result = await TopicController.createTopic(payload);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const updateTopic = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const payload = req.body || {};
    const errors = editTopicValidation(payload);
    if (errors != true) throw errors.shift();
    payload['updatedBy'] = req.currentUser._id;
    const result = await TopicController.updateTopic(
      Types.ObjectId(req.params.id),
      payload
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const deleteTopic = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await TopicController.deleteTopic(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const listMessages = async (req, res) => {
  try {
    if (!(req.params && req.params.topicId))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'topicId' };
    const result = await TopicController.listMessages(
      Types.ObjectId(req.params.topicId)
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const createMessage = async (req, res) => {
  try {
    if (!(req.params && req.params.topicId))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'topicId' };
    const payload = req.body || {};
    payload['topicId'] = req.params.topicId;
    const errors = createTopicMessageValidation(payload);
    if (errors != true) throw errors.shift();
    if (payload.hasOwnProperty('tripId'))
      payload['tripId'] = Types.ObjectId(payload['tripId']);
    if (payload.hasOwnProperty('topicId'))
      payload['topicId'] = Types.ObjectId(payload['topicId']);
    payload['userId'] = req.currentUser._id;
    const result = await TopicController.createMessage(payload);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const updateMessage = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const payload = req.body || {};
    const errors = editTopicMessageValidation(payload);
    if (errors != true) throw errors.shift();
    payload['userId'] = req.currentUser._id;
    const result = await TopicController.updateMessage(
      Types.ObjectId(req.params.id),
      payload
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await TopicController.deleteMessage(
      Types.ObjectId(req.params.id)
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
