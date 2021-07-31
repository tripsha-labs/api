const express = require('express');
const countries = require('./handler');
const router = express.Router();

router.get('/', countries.listCountries);

export default router;
