const express = require('express');
const tripTags = require('./handler');
const router = express.Router();

router.get('/', tripTags.listTripTags);

export default router;
