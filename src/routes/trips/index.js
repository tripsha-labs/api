const express = require('express');
import {
  createTrip,
  listTrips,
  getTrip,
  myTrips,
  savedTrips,
  updateTrip,
  deleteTrip,
  listMembers,
  tripBookings,
} from './handler';
const router = express.Router();

router.get('/', listTrips);
router.post('/', createTrip);
router.get('/mytrips', myTrips);
router.get('/saved-trips', savedTrips);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.get('/:id/members', listMembers);
router.get('/:id/booking', tripBookings);

export default router;
