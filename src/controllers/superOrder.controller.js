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
 * 1. Place Super Order
 * POST /v2/super/orders
 * Body: { dhanClientId, correlationId, transactionType, exchangeSegment, productType, orderType, securityId, quantity, price, targetPrice, stopLossPrice, trailingJump }
 */
async function placeSuperOrder(req, res) {
  try {
    const accessToken = req.headers['access-token'];
    if (!accessToken) {
      return res.status(401).json({
        errorType: 'AuthenticationError',
        errorMessage: 'Header "access-token" is required',
      });
    }

    const headers = getDhanHeaders(req);
    const orderPayload = req.body;

    console.log('[SUPER ORDER] Placing super order for securityId:', orderPayload.securityId, 'type:', orderPayload.transactionType);

    const response = await axios.post(`${API_BASE_URL}/v2/super/orders`, orderPayload, {
      headers,
      timeout: 10000,
    });

    console.log('[SUPER ORDER] Order Placed Successfully. Dhan Response:', response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[SUPER ORDER PLACE ERROR]:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || {
      errorType: 'InternalError',
      errorMessage: error.message || 'Failed to place super order',
    };

    return res.status(statusCode).json(errorData);
  }
}

/**
 * 2. Get All Super Orders for the day
 * GET /v2/super/orders
 */
async function getSuperOrders(req, res) {
  try {
    const accessToken = req.headers['access-token'];
    if (!accessToken) {
      return res.status(401).json({
        errorType: 'AuthenticationError',
        errorMessage: 'Header "access-token" is required',
      });
    }

    const headers = getDhanHeaders(req);

    console.log('[SUPER ORDER] Fetching super orders list...');

    const response = await axios.get(`${API_BASE_URL}/v2/super/orders`, {
      headers,
      params: req.query,
      timeout: 10000,
    });

    console.log('[SUPER ORDER] Fetched super orders successfully');
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[SUPER ORDER GET ERROR]:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || {
      errorType: 'InternalError',
      errorMessage: error.message || 'Failed to retrieve super orders',
    };

    return res.status(statusCode).json(errorData);
  }
}

/**
 * 3. Cancel Super Order Leg
 * DELETE /v2/super/orders/:orderId/:orderLeg
 * Params:
 *  - orderId: string
 *  - orderLeg: ENTRY_LEG | TARGET_LEG | STOP_LOSS_LEG
 */
async function cancelSuperOrderLeg(req, res) {
  try {
    const accessToken = req.headers['access-token'];
    if (!accessToken) {
      return res.status(401).json({
        errorType: 'AuthenticationError',
        errorMessage: 'Header "access-token" is required',
      });
    }

    const orderId = req.params.orderId || req.params['order-id'];
    const orderLeg = req.params.orderLeg || req.params['order-leg'];

    if (!orderId || !orderLeg) {
      return res.status(400).json({
        errorType: 'ValidationError',
        errorMessage: 'Both orderId and orderLeg are required in URL path (e.g. /v2/super/orders/:orderId/:orderLeg)',
      });
    }

    const headers = getDhanHeaders(req);

    console.log(`[SUPER ORDER] Cancelling order ${orderId}, leg: ${orderLeg}...`);

    const response = await axios.delete(`${API_BASE_URL}/v2/super/orders/${orderId}/${orderLeg}`, {
      headers,
      timeout: 10000,
    });

    console.log(`[SUPER ORDER] Leg cancelled successfully for order ${orderId}:`, response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[SUPER ORDER CANCEL ERROR]:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || {
      errorType: 'InternalError',
      errorMessage: error.message || 'Failed to cancel super order leg',
    };

    return res.status(statusCode).json(errorData);
  }
}

module.exports = {
  placeSuperOrder,
  getSuperOrders,
  cancelSuperOrderLeg,
};
