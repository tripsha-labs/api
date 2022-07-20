const express = require('express');
import {
  listBookings,
  createBooking,
  getBooking,
  bookingsAction,
  doPartPayment,
  updateBooking,
  multiUpdateBooking,
  createInvite,
  inviteAttendee,
  sendReminder,
  removeInvite,
} from './handler';
const router = express.Router();

router.get('/', listBookings);
router.post('/', createBooking);
router.post('/invite', createInvite);
router.delete('/invite', removeInvite);
router.post('/invite/reminder', sendReminder);
router.put('/', multiUpdateBooking);
router.get('/:id', getBooking);
router.put('/:id', updateBooking);
router.post('/:id/action', bookingsAction);
router.post('/:id/payment', doPartPayment);

export default router;
