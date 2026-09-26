import { Router } from 'express';
import * as inventoryController from './inventory.controller.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { validateRequiredFields, validateQuantity } from '../../middleware/validators.js';

const router = Router();

router.use(authenticate);

// GET /api/inventory/ledger (Move History Audit Log)
router.get('/ledger', inventoryController.handleGetLedger);

// GET /api/inventory/operations
router.get('/operations', inventoryController.handleGetOperations);

// GET /api/inventory/operations/:id
router.get('/operations/:id', inventoryController.handleGetOperationById);

// POST /api/inventory/operations
router.post(
  '/operations',
  validateRequiredFields(['type', 'lines']),
  validateQuantity,
  inventoryController.handleCreateOperation
);

// PUT /api/inventory/operations/:id/status
router.put(
  '/operations/:id/status',
  validateRequiredFields(['status']),
  inventoryController.handleUpdateStatus
);

// POST /api/inventory/operations/:id/validate (Atomic Stock Transaction Validation)
router.post('/operations/:id/validate', inventoryController.handleValidateOperation);

export default router;
