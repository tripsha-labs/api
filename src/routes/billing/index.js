const express = require('express');
import { unbilledPayment, listInvoices, getInvoice } from './handler';
const router = express.Router();

router.get('/unbilled-payment', unbilledPayment);
router.get('/invoices', listInvoices);
router.get('/invoices/:id', getInvoice);

export default router;
