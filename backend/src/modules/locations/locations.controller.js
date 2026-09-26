import * as locationsService from './locations.service.js';

export const handleGetLocations = async (req, res, next) => {
  try {
    const { type } = req.query;
    const locations = await locationsService.getAllLocations(type);
    return res.status(200).json({ success: true, locations });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const handleGetLocationById = async (req, res, next) => {
  try {
    const location = await locationsService.getLocationById(req.params.id);
    return res.status(200).json({ success: true, location });
  } catch (error) {
    return res.status(404).json({ success: false, error: error.message });
  }
};

export const handleCreateLocation = async (req, res, next) => {
  try {
    const location = await locationsService.createLocation(req.body);
    return res.status(201).json({ success: true, location });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleUpdateLocation = async (req, res, next) => {
  try {
    const location = await locationsService.updateLocation(req.params.id, req.body);
    return res.status(200).json({ success: true, location });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleDeleteLocation = async (req, res, next) => {
  try {
    const result = await locationsService.deleteLocation(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
