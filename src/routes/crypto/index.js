const express = require('express');
const { convertTokenUnits, getNextSpendAllowanceNonce } = require('./handler');

const router = express.Router();

//convert usd to token units using price source
router.post('/convert-token-units', convertTokenUnits);

//get the next spend allowance signature nonce for a chain/token/address
router.get(
  '/next-spend-nonce/:chainId/:token/:address',
  getNextSpendAllowanceNonce
);

export default router;
