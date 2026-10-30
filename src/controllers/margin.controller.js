const axios = require('axios');
const { API_BASE_URL } = require('../config/dhan.config');

/**
 * Helper to build standard Dhan headers
 */
function getDhanHeaders(req) {
  const accessToken = req.headers['access-token'];
  const dhanClientId = req.headers['dhanclientid'] || req.headers['dhan-client-id'] || req.body?.dhanClientId;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (accessToken) {
    headers['access-token'] = accessToken;
  }
  if (dhanClientId) {
    headers['dhanClientId'] = dhanClientId.toString();
  }

  return headers;
}

/**
 * 1. Calculate Margin for an Order
 * POST /v2/margincalculator
 * Body: { dhanClientId, exchangeSegment, transactionType, quantity, productType, securityId, price, triggerPrice }
 */
async function calculateMargin(req, res) {
  try {
    const accessToken = req.headers['access-token'];
    if (!accessToken) {
      return res.status(401).json({
        errorType: 'AuthenticationError',
        errorMessage: 'Header "access-token" is required',
      });
    }

    const headers = getDhanHeaders(req);
    const payload = req.body;

    console.log('[MARGIN CALCULATOR] Request received:', {
      securityId: payload.securityId,
      exchangeSegment: payload.exchangeSegment,
      transactionType: payload.transactionType,
      productType: payload.productType,
      quantity: payload.quantity,
      price: payload.price,
    });

    const response = await axios.post(`${API_BASE_URL}/v2/margincalculator`, payload, {
      headers,
      timeout: 10000,
    });

    console.log('[MARGIN CALCULATOR] Dhan Response:', response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[MARGIN CALCULATOR ERROR]:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || {
      errorType: 'InternalError',
      errorMessage: error.message || 'Failed to calculate margin',
    };

    return res.status(statusCode).json(errorData);
  }
}

/**
 * 2. Get Available Fund Limits
 * GET /v2/fundlimit or /fundlimit
 */
async function getFundLimits(req, res) {
  try {
    const accessToken = req.headers['access-token'];
    if (!accessToken) {
      return res.status(401).json({
        errorType: 'AuthenticationError',
        errorMessage: 'Header "access-token" is required',
      });
    }

    const headers = getDhanHeaders(req);

    console.log('[FUND LIMIT] Fetching available funds from Dhan...');

    // Try /v2/fundlimit first, fallback to /fundlimit if Dhan v2 differs
    let response;
    try {
      response = await axios.get(`${API_BASE_URL}/v2/fundlimit`, {
        headers,
        timeout: 10000,
      });
    } catch (v2Err) {
      if (v2Err.response?.status === 404) {
        console.log('[FUND LIMIT] /v2/fundlimit 404, falling back to /fundlimit');
        response = await axios.get(`${API_BASE_URL}/fundlimit`, {
          headers,
          timeout: 10000,
        });
      } else {
        throw v2Err;
      }
    }

    console.log('[FUND LIMIT] Fetched successfully:', response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[FUND LIMIT ERROR]:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || {
      errorType: 'InternalError',
      errorMessage: error.message || 'Failed to retrieve fund limit',
    };

    return res.status(statusCode).json(errorData);
  }
}

/**
 * 3. Calculate Margin for Multiple Orders (Basket)
 * POST /v2/margincalculator/multi
 */
async function calculateMultiMargin(req, res) {
  try {
    const accessToken = req.headers['access-token'];
    if (!accessToken) {
      return res.status(401).json({
        errorType: 'AuthenticationError',
        errorMessage: 'Header "access-token" is required',
      });
    }

    const headers = getDhanHeaders(req);
    const payload = req.body;

    console.log('[MULTI MARGIN] Request received with order count:', Array.isArray(payload) ? payload.length : 'non-array');

    const response = await axios.post(`${API_BASE_URL}/v2/margincalculator/multi`, payload, {
      headers,
      timeout: 10000,
    });

    console.log('[MULTI MARGIN] Dhan Response:', response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[MULTI MARGIN ERROR]:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || {
      errorType: 'InternalError',
      errorMessage: error.message || 'Failed to calculate multi-order margin',
    };

    return res.status(statusCode).json(errorData);
  }
}

module.exports = {
  calculateMargin,
  getFundLimits,
  calculateMultiMargin,
};

