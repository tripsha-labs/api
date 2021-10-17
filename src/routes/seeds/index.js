const express = require('express');
const router = express.Router();
import { getSeeds } from './handler';

router.get('/', getSeeds);

export default router;
