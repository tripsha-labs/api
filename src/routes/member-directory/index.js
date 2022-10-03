const express = require('express');
const router = express.Router();
import { listMembers, createMembers, deleteMembers } from './handler';

router.get('/', listMembers);
router.post('/', createMembers);
router.delete('/', deleteMembers);

export default router;
