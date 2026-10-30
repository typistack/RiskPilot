const express = require('express');
const router = express.Router();
const marginController = require('../controllers/margin.controller');

// Calculate margin requirement for a single order
router.post('/v2/margincalculator', marginController.calculateMargin);

// Retrieve available funds & limit details
router.get('/v2/fundlimit', marginController.getFundLimits);
router.get('/fundlimit', marginController.getFundLimits);

// Calculate margin requirement for multiple orders
router.post('/v2/margincalculator/multi', marginController.calculateMultiMargin);

module.exports = router;

