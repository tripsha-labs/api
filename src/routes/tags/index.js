const express = require('express');
const tags = require('./handler');
const router = express.Router();

router.get('/', tags.listTags);

export default router;
