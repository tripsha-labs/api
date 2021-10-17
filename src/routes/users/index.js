const express = require('express');
const router = express.Router();
import {
  listUser,
  createUser,
  inviteUser,
  isUserExists,
  subscribeUser,
  unsubscribeUser,
  getUser,
  updateUser,
  deleteUser,
} from './handler';

router.get('/', listUser);
router.post('/', createUser);
router.post('/invite', inviteUser);
router.post('/check-user-exists', isUserExists);
router.post('/subscribe', subscribeUser);
router.post('/unsubscribe', unsubscribeUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
