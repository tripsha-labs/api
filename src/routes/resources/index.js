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
} from './handler';

router.get('/', listResources);
router.post('/', createResource);
router.get('/:id', getResource);
router.put('/:id', updateResource);
router.delete('/', deleteResources);
// router.get('/:collectionId', getCollection);
router.put('/collection/:id', updateCollection);
router.delete('/collection/:id', deleteCollection);
// router.post('/:collectionId/resources', createResource);
// router.get('/:collectionId/resources', getResources);
// router.delete('/:collectionId/resources/:resourceId', deleteResource);
// router.put('/:collectionId/resources/:resourceId', updateResource);

export default router;
