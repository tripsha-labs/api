const express = require('express');
const router = express.Router();
import { getUserByUsername } from './handler';

router.get('/', getUserByUsername);

export default router;
