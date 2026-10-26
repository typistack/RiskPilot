const express = require('express');
const router = express.Router();
const { generateAccessToken } = require('../controllers/auth.controller');

// Standard Dhan path
router.post('/app/generateAccessToken', generateAccessToken);

// Clean aliases so frontend/postman can call either
router.post('/generateAccessToken', generateAccessToken);
router.post('/api/auth/login', generateAccessToken);
router.post('/api/login', generateAccessToken);

module.exports = router;
