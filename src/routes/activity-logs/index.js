const express = require('express');
import { listActivities, updateActivities } from './handler';
const router = express.Router();

router.get('/', listActivities);
router.put('/', updateActivities);

export default router;
