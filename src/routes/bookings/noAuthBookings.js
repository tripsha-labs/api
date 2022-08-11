const express = require('express');
import { respond, getInvite } from './handler';
const router = express.Router();

router.get('/', getInvite);
router.get('/response', respond);

export default router;
