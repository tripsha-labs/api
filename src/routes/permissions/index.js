const express = require('express');
const router = express.Router();
import {
  listUserPermissions,
  createUserPermissions,
  deleteUserPermissions,
  listGroupPermissions,
  createGroupPermissions,
  deleteGroupPermissions,
  testPermissions,
} from './handler';

router.get('/user', listUserPermissions);
router.post('/user', createUserPermissions);
router.delete('/user', deleteUserPermissions);
router.get('/group', listGroupPermissions);
router.get('/test', testPermissions);
router.post('/group', createGroupPermissions);
router.delete('/group', deleteGroupPermissions);

export default router;
