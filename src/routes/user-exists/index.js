const express = require('express');
const router = express.Router();
import { checkUserExists } from './handler';
router.get('/', checkUserExists);

export default router;
