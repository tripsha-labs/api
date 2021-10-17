const express = require('express');
import {
  createTrip,
  listTrips,
  getTrip,
  myTrips,
  savedTrips,
  updateTrip,
  deleteTrip,
} from './handler';
const router = express.Router();

router.get('/', listTrips);
router.post('/', createTrip);
router.get('/mytrips', myTrips);
router.get('/saved-trips', savedTrips);
router.get('private', listTrips);
router.get('private/:id', getTrip);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
