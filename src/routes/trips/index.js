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
  transferHost,
  addCoHost,
  deleteCoHost,
  getCoHosts,
  invitedTrips,
  createProject,
  activeTrips,
  updateDraftTrip,
} from './handler';
const router = express.Router();

router.get('/', listTrips);
router.post('/', createTrip);
router.post('/project', createProject);
router.get('/active-trips', activeTrips);
router.get('/mytrips', myTrips);
router.get('/invited', invitedTrips);
router.get('/saved-trips', savedTrips);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.put('/:id/draft', updateDraftTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/transfer-host', transferHost);
router.post('/:id/co-hosts', addCoHost);
router.delete('/:id/co-hosts', deleteCoHost);
router.get('/:id/co-hosts', getCoHosts);
router.get('/:id/members', listMembers);
router.get('/:id/booking', tripBookings);

export default router;
