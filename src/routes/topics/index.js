const express = require('express');
import {
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  listMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from './handler';
const router = express.Router();

router.get('/', listTopics);
router.post('/', createTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);
router.get('/:topicId/messages', listMessages);
router.post('/:topicId/messages', createMessage);
router.put('/:topicId/messages/:id', updateMessage);
router.delete('/:topicId/messages/:id', deleteMessage);
export default router;
