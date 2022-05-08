const express = require('express');
const router = express.Router();
import { listAssets, createAsset, updateAsset, deleteAsset } from './handler';

router.get('/', listAssets);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;
