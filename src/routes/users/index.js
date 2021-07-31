const express = require('express');
const users = require('./handler');
const router = express.Router();

router.get('/', users.listUser);
router.post('/', users.createUser);
router.post('/invite', users.inviteUser);
router.post('/check-user-exists', users.isUserExists);
router.post('/subscribe', users.subscribeUser);
router.post('/unsubscribe', users.unsubscribeUser);
router.get('/{id}', users.getUser);
router.put('/{id}', users.updateUser);
router.delete('/{id}', users.deleteUser);

export default router;
