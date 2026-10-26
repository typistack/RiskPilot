const axios = require('axios');
const { API_BASE_URL } = require('../config/dhan.config');

/**
 * Get Dhan User Profile
 * GET /v2/profile
 * Headers: access-token (required), dhanClientId (optional)
 */
async function getProfile(req, res) {
  try {
    const accessToken = req.headers['access-token'];
    const dhanClientId = req.headers['dhanclientid'] || req.headers['dhan-client-id'];

    if (!accessToken) {
      return res.status(401).json({
        errorType: 'AuthenticationError',
        errorMessage: 'Header "access-token" is required',
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'access-token': accessToken,
    };

    if (dhanClientId) {
      headers['dhanClientId'] = dhanClientId;
    }

    console.log('[PROFILE] Fetching profile from Dhan API...');

    const response = await axios.get(`${API_BASE_URL}/v2/profile`, {
      headers,
      timeout: 10000,
    });

    console.log('[PROFILE] Success. Dhan response:', response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[PROFILE ERROR]:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || {
      errorType: 'InternalError',
      errorMessage: error.message || 'Failed to fetch user profile',
    };

    return res.status(statusCode).json(errorData);
  }
}

module.exports = {
  getProfile,
};
