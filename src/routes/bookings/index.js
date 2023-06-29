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
  removeInvite,
  sendCustomReminderMessage,
  getInvites,
  respondInvite,
  updateGuestFields,
  addGuests,
  removeGuests,
} from './handler';
const router = express.Router();

router.get('/', listBookings);
router.post('/', createBooking);
router.post('/invite', createInvite);
router.delete('/invite', removeInvite);
router.post('/invite/custom-email', sendCustomReminderMessage);
router.put('/', multiUpdateBooking);
router.get('/:id', getBooking);
router.get('/:id/invites', getInvites);
router.post('/:id/invites', respondInvite);
router.put('/:id', updateBooking);
router.put('/:id/custom-fields', updateCustomFields);
router.put('/:id/guest-fields', updateGuestFields);
router.post('/:id/action', bookingsAction);
router.post('/:id/payment', doPartPayment);
router.post('/:id/add-guests', addGuests);
router.delete('/:id/remove-guests', removeGuests);

export default router;
