const express = require('express');
const router = express.Router();
import {
  listAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  updateMultiple,
} from './handler';

router.get('/', listAssets);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.post('/bulk-action', updateMultiple);
router.delete('/', deleteAsset);

export default router;
