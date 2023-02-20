const express = require('express');
const router = express.Router();
import { seeds } from './handler';

router.get('/', seeds);

export default router;
