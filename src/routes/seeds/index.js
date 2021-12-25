const express = require('express');
const router = express.Router();
import { seeds, airtable } from './handler';

router.get('/', seeds);
// router.get('/', airtable);

export default router;
