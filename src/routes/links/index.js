const express = require('express');
const router = express.Router();
import { listLinks, createLink, updateLink, deleteLinks } from './handler';

router.get('/', listLinks);
router.post('/', createLink);
router.put('/:id', updateLink);
router.delete('/', deleteLinks);

export default router;
