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
} from './handler';
const router = express.Router();

router.get('/', listBookings);
router.post('/', createBooking);
router.post('/invite', createInvite);
router.post('/invite/reminder', createInvite);
router.put('/', multiUpdateBooking);
router.get('/:id', getBooking);
router.put('/:id', updateBooking);
router.post('/:id/action', bookingsAction);
router.post('/:id/payment', doPartPayment);

export default router;
