const express = require('express');
const router = express.Router();
import {
  listCoupons,
  createCoupon,
  applyCoupon,
  updateCoupon,
  deleteCoupon,
} from './handler';

router.get('/', listCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);
router.post('/apply', applyCoupon);

export default router;
