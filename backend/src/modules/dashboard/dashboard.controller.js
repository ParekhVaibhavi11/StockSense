import * as dashboardService from './dashboard.service.js';

export const handleGetKPIs = async (req, res, next) => {
  try {
    const kpis = await dashboardService.getDashboardKPIs();
    return res.status(200).json({ success: true, kpis });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const handleGetLowStockAlerts = async (req, res, next) => {
  try {
    const alerts = await dashboardService.getLowStockAlerts();
    return res.status(200).json({ success: true, alerts });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const handleGetRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '5', 10);
    const recent = await dashboardService.getRecentMovements(limit);
    return res.status(200).json({ success: true, recent });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
