import { Router } from 'express';
import * as productsController from './products.controller.js';
import { authenticate, requireRole } from '../../middleware/authMiddleware.js';
import { validateRequiredFields } from '../../middleware/validators.js';

const router = Router();

router.use(authenticate);

// GET /api/products/categories
router.get('/categories', productsController.handleGetCategories);

// POST /api/products/categories
router.post(
  '/categories',
  validateRequiredFields(['name']),
  productsController.handleCreateCategory
);

// GET /api/products
router.get('/', productsController.handleGetProducts);

// GET /api/products/:id
router.get('/:id', productsController.handleGetProductById);

// POST /api/products
router.post(
  '/',
  validateRequiredFields(['name', 'sku', 'uom']),
  productsController.handleCreateProduct
);

// PUT /api/products/:id
router.put('/:id', productsController.handleUpdateProduct);

// DELETE /api/products/:id (Managers only)
router.delete('/:id', requireRole(['inventory_manager']), productsController.handleDeleteProduct);

export default router;
