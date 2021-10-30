const express = require('express');
const router = express.Router();
import {
  createIntent,
  saveCard,
  createPayment,
  verifyConnectAccount,
  listCards,
} from './handler';

router.get('/setup', createIntent);
router.post('/save-card', saveCard);
router.post('/charge', createPayment);
router.post('/connect-oauth', verifyConnectAccount);
router.get('/list-cards', listCards);

export default router;
