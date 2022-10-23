const express = require('express');
const router = express.Router();
import {
  getCollection,
  listCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  createResource,
  getResources,
  deleteResource,
  updateResource,
} from './handler';

router.get('/', listCollections);
router.post('/', createCollection);
router.get('/:collectionId', getCollection);
router.put('/:collectionId', updateCollection);
router.delete('/:collectionId', deleteCollection);
router.post('/:collectionId/resources', createResource);
router.get('/:collectionId/resources', getResources);
router.delete('/:collectionId/resources/:resourceId', deleteResource);
router.put('/:collectionId/resources/:resourceId', updateResource);

export default router;
