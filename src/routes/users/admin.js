const express = require('express');
const router = express.Router();
import { updateUserAdmin, adminUserAction, adminTrips } from './handler';

router.put('/users/:id', updateUserAdmin);
router.post('/users/action', adminUserAction);
router.get('/trips', adminTrips);

export default router;
