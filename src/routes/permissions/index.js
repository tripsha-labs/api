const express = require('express');
const router = express.Router();
import {
  listUserPermissions,
  createUserPermissions,
  deleteUserPermissions,
} from './handler';

router.get('/user', listUserPermissions);
router.post('/user', createUserPermissions);
router.delete('/user', deleteUserPermissions);

export default router;
