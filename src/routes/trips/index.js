const express = require('express');
const trips = require('./handler');
const router = express.Router();

router.get('/', trips.listTrips);
// router.post('/', trips.createTrip);
// router.post('/invite', trips.inviteUser);
// router.post('/check-user-exists', trips.isUserExists);
// router.post('/subscribe', trips.subscribeUser);
// router.post('/unsubscribe', trips.unsubscribeUser);
// router.get('/{id}', trips.getTrip);
// router.put('/{id}', trips.updateTrip);
// router.delete('/{id}', trips.deleteTrip);

export default router;
