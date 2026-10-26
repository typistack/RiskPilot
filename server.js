require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Modular Routes
const authRoutes = require('./src/routes/auth.routes');
const profileRoutes = require('./src/routes/profile.routes');
const superOrderRoutes = require('./src/routes/superOrder.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dhan Broker Backend is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Register API Routes
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', superOrderRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({
    errorType: 'NotFoundError',
    errorMessage: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Dhan Broker Backend running on port ${PORT}`);
  console.log(` Base URL       : http://localhost:${PORT}`);
  console.log(` 1. Auth        : POST   http://localhost:${PORT}/app/generateAccessToken`);
  console.log(` 2. Profile     : GET    http://localhost:${PORT}/v2/profile`);
  console.log(` 3. Place Order : POST   http://localhost:${PORT}/v2/super/orders`);
  console.log(` 4. Get Orders  : GET    http://localhost:${PORT}/v2/super/orders`);
  console.log(` 5. Cancel Leg  : DELETE http://localhost:${PORT}/v2/super/orders/:orderId/:orderLeg`);
  console.log(` 6. Health      : GET    http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
