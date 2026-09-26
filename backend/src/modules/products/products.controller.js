import * as productsService from './products.service.js';

export const handleGetProducts = async (req, res, next) => {
  try {
    const { search, category_id } = req.query;
    const products = await productsService.getAllProducts({ search, category_id });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const handleGetProductById = async (req, res, next) => {
  try {
    const product = await productsService.getProductById(req.params.id);
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(404).json({ success: false, error: error.message });
  }
};

export const handleCreateProduct = async (req, res, next) => {
  try {
    const product = await productsService.createProduct(req.body);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleUpdateProduct = async (req, res, next) => {
  try {
    const product = await productsService.updateProduct(req.params.id, req.body);
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleDeleteProduct = async (req, res, next) => {
  try {
    const result = await productsService.deleteProduct(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const handleGetCategories = async (req, res, next) => {
  try {
    const categories = await productsService.getAllCategories();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const handleCreateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await productsService.createCategory(name);
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
