const express = require('express');
import { listApprovals, createApproval, actionApproval } from './handler';
const router = express.Router();

router.get('/', listApprovals);
router.post('/', createApproval);
router.put('/:id', actionApproval);

export default router;
