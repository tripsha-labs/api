const express = require('express');
const router = express.Router();
import { runMigrations } from './handler';

router.get('/', runMigrations);

export default router;
