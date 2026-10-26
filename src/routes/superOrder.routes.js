const express = require('express');
const router = express.Router();
const {
  placeSuperOrder,
  getSuperOrders,
  cancelSuperOrderLeg,
} = require('../controllers/superOrder.controller');

// 1. Place Super Order: POST /v2/super/orders
router.post('/v2/super/orders', placeSuperOrder);

// 2. Get Super Orders List: GET /v2/super/orders
router.get('/v2/super/orders', getSuperOrders);

// 3. Cancel Super Order Leg: DELETE /v2/super/orders/:orderId/:orderLeg
// Supports both camelCase and kebab-case path parameters
router.delete('/v2/super/orders/:orderId/:orderLeg', cancelSuperOrderLeg);
router.delete('/v2/super/orders/:order-id/:order-leg', cancelSuperOrderLeg);

module.exports = router;
