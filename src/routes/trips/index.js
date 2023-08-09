const express = require('express');
import {
  listTrips,
  getTrip,
  myTrips,
  updateTrip,
  deleteTrip,
  listMembers,
  tripBookings,
  transferHost,
  createProject,
  activeTrips,
  updateDraftTrip,
  publishTrip,
  unPublishTrip,
  editProject,
  cancelTrip,
  restoreTrip,
} from './handler';
const router = express.Router();

router.get('/', listTrips);
router.post('/project', createProject);
router.put('/project/:id', editProject);
router.get('/active-trips', activeTrips);
router.get('/mytrips', myTrips);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.put('/:id/draft', updateDraftTrip);
router.put('/:id/publish', publishTrip);
router.put('/:id/unpublish', unPublishTrip);
router.delete('/:id/cancel', cancelTrip);
router.put('/:id/restore', restoreTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/transfer-host', transferHost);
router.get('/:id/members', listMembers);
router.get('/:id/booking', tripBookings);

export default router;
