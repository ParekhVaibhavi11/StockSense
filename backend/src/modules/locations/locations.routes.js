import { Router } from 'express';
import * as locationsController from './locations.controller.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';
import { validateRequiredFields } from '../../middleware/validators.js';

const router = Router();

router.use(authenticate);

// GET /api/locations
router.get('/', locationsController.handleGetLocations);

// GET /api/locations/:id
router.get('/:id', locationsController.handleGetLocationById);

// POST /api/locations
router.post(
  '/',
  validateRequiredFields(['name', 'code', 'type']),
  locationsController.handleCreateLocation
);

// PUT /api/locations/:id
router.put('/:id', locationsController.handleUpdateLocation);

// DELETE /api/locations/:id (Managers only)
router.delete('/:id', requireRole(['inventory_manager']), locationsController.handleDeleteLocation);

export default router;
