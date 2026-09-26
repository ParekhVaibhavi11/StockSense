import * as suppliersService from './suppliers.service.js';

export const handleGetSuppliers = async (req, res, next) => {
  try {
    const suppliers = await suppliersService.getAllSuppliers();
    return res.status(200).json({ success: true, suppliers });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const handleGetSupplierById = async (req, res, next) => {
  try {
    const supplier = await suppliersService.getSupplierById(req.params.id);
    return res.status(200).json({ success: true, supplier });
  } catch (error) {
    return res.status(404).json({ success: false, error: error.message });
  }
};

export const handleCreateSupplier = async (req, res, next) => {
  try {
    const supplier = await suppliersService.createSupplier(req.body);
    return res.status(201).json({ success: true, supplier });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleUpdateSupplier = async (req, res, next) => {
  try {
    const supplier = await suppliersService.updateSupplier(req.params.id, req.body);
    return res.status(200).json({ success: true, supplier });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleDeleteSupplier = async (req, res, next) => {
  try {
    const result = await suppliersService.deleteSupplier(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
