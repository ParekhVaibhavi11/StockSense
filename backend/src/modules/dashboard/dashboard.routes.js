import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// GET /api/dashboard/kpis
router.get('/kpis', dashboardController.handleGetKPIs);

// GET /api/dashboard/low-stock-alerts
router.get('/low-stock-alerts', dashboardController.handleGetLowStockAlerts);

// GET /api/dashboard/recent-activity
router.get('/recent-activity', dashboardController.handleGetRecentActivity);

export default router;
