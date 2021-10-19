const express = require('express');
import { listActivities } from './handler';
const router = express.Router();

router.get('/', listActivities);

export default router;
