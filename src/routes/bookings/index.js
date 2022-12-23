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
  updateCustomFields,
  sendReminder,
  removeInvite,
  sendCustomReminderMessage,
} from './handler';
const router = express.Router();

router.get('/', listBookings);
router.post('/', createBooking);
router.post('/invite', createInvite);
router.delete('/invite', removeInvite);
router.post('/invite/reminder', sendReminder);
router.post('/invite/custom-email', sendCustomEmail);
router.put('/', multiUpdateBooking);
router.get('/:id', getBooking);
router.get('/:id/invites', getInvites);
router.post('/:id/invites', respondInvite);
router.put('/:id', updateBooking);
router.put('/:id/custom-fields', updateCustomFields);
router.post('/:id/action', bookingsAction);
router.post('/:id/payment', doPartPayment);

export default router;
