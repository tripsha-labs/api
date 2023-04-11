const express = require('express');
const router = express.Router();
import { getCurrency } from './handler';

router.get('/', getCurrency);

export default router;
