const express = require('express');
import { memberActions } from './handler';
const router = express.Router();

router.post('/action', memberActions);

export default router;
