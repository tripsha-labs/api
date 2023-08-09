const express = require('express');
const { convertTokenUnits } = require('./handler');

const router = express.Router();

router.post('/convert-token-units', convertTokenUnits);

export default router;
