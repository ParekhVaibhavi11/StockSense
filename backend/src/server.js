import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Feature Modules
import authRoutes from './modules/auth/auth.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';

import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import locationsRoutes from './modules/locations/locations.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import suppliersRoutes from './modules/suppliers/suppliers.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'StockSense IMS API',
    timestamp: new Date().toISOString(),
  });
});

// Register Modular Feature Routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/suppliers', suppliersRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`\n🚀 StockSense API Server running on http://localhost:${PORT}`);
  console.log(`👉 Health check available at http://localhost:${PORT}/api/health\n`);
});

export default app;
