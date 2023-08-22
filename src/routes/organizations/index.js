const express = require('express');
const router = express.Router();
import {
  listOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganization,
  listOrganizationPermissions,
  createUpdateOrganizationPermission,
  deleteOrganizationPermissions,
  listProjects,
} from './handler';

// Organizations API
router.get('/', listOrganizations);
router.post('/', createOrganization);
router.get('/:id', getOrganization);
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);

// Organization permissions API
router.get('/:id/projects', listProjects);
router.get('/:id/permissions', listOrganizationPermissions);
router.post('/:id/permissions', createUpdateOrganizationPermission);
router.delete('/:id/permissions', deleteOrganizationPermissions);
export default router;
