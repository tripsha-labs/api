const express = require('express');
const router = express.Router();
import {
  listResources,
  createResource,
  getResource,
  deleteResources,
  updateResource,
  updateCollection,
  deleteCollection,
  assignResources,
  unassignResources,
} from './handler';

router.get('/', listResources);
router.post('/', createResource);
router.get('/:id', getResource);
router.put('/:id', updateResource);
router.delete('/', deleteResources);
router.put('/collection/:id', updateCollection);
router.delete('/collection/:id', deleteCollection);
router.post('/assign', assignResources);
router.post('/unassign', unassignResources);
export default router;
