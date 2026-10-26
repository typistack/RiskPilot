const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/profile.controller');

// GET /v2/profile
router.get('/v2/profile', getProfile);

module.exports = router;
