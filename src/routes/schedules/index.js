const express = require('express');
const router = express.Router();
import { runSchedule } from './handler';

router.get('/', runSchedule);

export default router;
