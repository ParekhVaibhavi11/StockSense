import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Feature Modules
import authRoutes from './modules/auth/auth.routes.js';

import { errorHandler } from './middleware/errorHandler.js';

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

// Global Error Handler Middleware
app.use(errorHandler);

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`\n🚀 StockSense API Server running on http://localhost:${PORT}`);
  console.log(`👉 Health check available at http://localhost:${PORT}/api/health\n`);
});

export default app;
