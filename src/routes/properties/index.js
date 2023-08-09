const express = require('express');
const router = express.Router();
import {
  listProperties,
  createProperties,
  updateProperties,
  deleteProperties,
} from './handler';

router.get('/', listProperties);
router.post('/', createProperties);
router.delete('/:id', deleteProperties);
router.put('/:id', updateProperties);

export default router;
