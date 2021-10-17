const express = require('express');
import {
  getHostRequest,
  listHostRequests,
  createHostRequest,
  updateHostRequest,
  deleteHostRequest,
} from './handler';
const router = express.Router();

router.get('/', listHostRequests);
router.post('/', createHostRequest);
router.get('/:id', getHostRequest);
router.put('/:id', updateHostRequest);
router.delete('/:id', deleteHostRequest);

export default router;
