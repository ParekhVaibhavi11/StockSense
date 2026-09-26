import { Router } from 'express';
import * as suppliersController from './suppliers.controller.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';
import { validateRequiredFields } from '../../middleware/validators.js';

const router = Router();

// Protect all supplier routes with JWT authentication
router.use(authenticate);

// GET /api/suppliers
router.get('/', suppliersController.handleGetSuppliers);

// GET /api/suppliers/:id
router.get('/:id', suppliersController.handleGetSupplierById);

// POST /api/suppliers
router.post(
  '/',
  validateRequiredFields(['name']),
  suppliersController.handleCreateSupplier
);

// PUT /api/suppliers/:id
router.put('/:id', suppliersController.handleUpdateSupplier);

// DELETE /api/suppliers/:id (Managers only)
router.delete('/:id', requireRole(['inventory_manager']), suppliersController.handleDeleteSupplier);

export default router;
