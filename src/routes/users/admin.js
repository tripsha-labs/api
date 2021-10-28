const express = require('express');
const router = express.Router();
import { updateUserAdmin, adminUserAction } from './handler';

router.put('/users/:id', updateUserAdmin);
router.post('/users/action', adminUserAction);

export default router;
