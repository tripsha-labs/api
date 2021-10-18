const express = require('express');
import { listTrips, getTrip } from './handler';
const router = express.Router();

router.get('/', listTrips);
router.get('/:id', getTrip);

export default router;
