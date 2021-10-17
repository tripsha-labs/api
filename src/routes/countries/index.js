const express = require('express');
const router = express.Router();
import { listCountries } from './handler';

router.get('/', listCountries);

export default router;
