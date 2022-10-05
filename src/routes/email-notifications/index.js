const express = require('express');
const router = express.Router();
import { getSyncUrl, setToken, getEmails } from './handler';

router.get('/get-sync-url', getSyncUrl);
router.post('/set-token', setToken);
router.get('/get-emails', getEmails);

export default router;
