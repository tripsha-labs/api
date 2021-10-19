const express = require('express');
const router = express.Router();
import { listTags } from './handler';
router.get('/', listTags);

export default router;
