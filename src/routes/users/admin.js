const express = require('express');
const router = express.Router();
import { updateUserAdmin, adminUserAction, adminTrips } from './handler';
import {
  updateOrganizationAdmin,
  listAdminOrganizations,
} from '../organizations/handler';

router.put('/users/:id', updateUserAdmin);
router.post('/users/action', adminUserAction);
router.get('/trips', adminTrips);
router.put('/organizations/:id', updateOrganizationAdmin);
router.get('/organizations', listAdminOrganizations);

export default router;
