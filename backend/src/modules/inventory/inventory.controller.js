import * as inventoryService from './inventory.service.js';

export const handleCreateOperation = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.user ? req.user.id : null,
    };
    const operation = await inventoryService.createOperation(payload);
    return res.status(201).json({ success: true, operation });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleGetOperations = async (req, res, next) => {
  try {
    const { type, status, location_id } = req.query;
    const operations = await inventoryService.getOperationsList({ type, status, location_id });
    return res.status(200).json({ success: true, operations });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const handleGetOperationById = async (req, res, next) => {
  try {
    const operation = await inventoryService.getOperationById(req.params.id);
    return res.status(200).json({ success: true, operation });
  } catch (error) {
    return res.status(404).json({ success: false, error: error.message });
  }
};

export const handleUpdateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await inventoryService.updateOperationStatus(id, status);
    return res.status(200).json({ success: true, operation: updated });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleValidateOperation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const result = await inventoryService.validateOperation(id, userId);
    return res.status(200).json({
      success: true,
      message: `Operation ${result.reference} validated successfully! Stock updated.`,
      operation: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleGetLedger = async (req, res, next) => {
  try {
    const { search, type, location_id } = req.query;
    const ledger = await inventoryService.getStockLedger({ search, type, location_id });
    return res.status(200).json({ success: true, ledger });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
