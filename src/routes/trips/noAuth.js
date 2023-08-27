const express = require('express');
import { getTrip } from './handler';
import TripController from './trip.controller';
const router = express.Router();

router.get('/', TripController.getAllPublicTrips);
router.get('/:id', getTrip);

export default router;
