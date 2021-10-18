const express = require('express');
import { listConversations, listMessages, sendMessage } from './handler';
const router = express.Router();

router.get('/', listConversations);
router.get('/messages', listMessages);
router.post('/send-message', sendMessage);

export default router;
