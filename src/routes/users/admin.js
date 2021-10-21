const express = require('express');
const router = express.Router();
import { updateUserAdmin } from './handler';

router.put('/users/:id', updateUserAdmin);

export default router;
