const express = require('express');
const router = express.Router();
import {
  listCoupons,
  createCoupon,
  applyCoupon,
  updateCoupon,
  deleteCoupon,
  getTrips,
  getHosts,
} from './handler';

router.get('/', listCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.get('/:id/trips', getTrips);
router.get('/:id/hosts', getHosts);
router.delete('/:id', deleteCoupon);
router.post('/apply', applyCoupon);

export default router;
