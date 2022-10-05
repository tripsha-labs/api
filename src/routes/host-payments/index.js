const express = require('express');
import {
  listPayments,
  createPayment,
  getPayment,
  updatePayment,
  multiDeletePayment,
} from './handler';
const router = express.Router();

router.get('/', listPayments);
router.post('/', createPayment);
router.delete('/', multiDeletePayment);
router.get('/:id', getPayment);
router.put('/:id', updatePayment);

export default router;
