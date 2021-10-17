const express = require('express');
const router = express.Router();
import { runMigrations } from './handler';

router.post('/', runMigrations);

export default router;
