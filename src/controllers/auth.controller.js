const axios = require('axios');
const { AUTH_BASE_URL } = require('../config/dhan.config');
const { generateTOTP } = require('../utils/totp.util');

/**
 * Controller for Dhan Authentication
 * Generates dynamic TOTP and calls Dhan access token endpoint
 */
async function generateAccessToken(req, res) {
  try {
    // Read from query params (e.g. ?dhanClientId=...&pin=...) or JSON body
    const dhanClientId = req.query.dhanClientId || req.body.dhanClientId || process.env.DHAN_CLIENT_ID;
    const pin = req.query.pin || req.body.pin || process.env.DHAN_PIN;
    const totpSecret = req.query.totpSecret || req.body.totpSecret || process.env.DHAN_TOTP_SECRET;
    let totp = req.query.totp || req.body.totp;

    // Validation
    if (!dhanClientId) {
      return res.status(400).json({
        errorType: 'ValidationError',
        errorMessage: 'Missing dhanClientId. Query param ya JSON body me dhanClientId provide karein.',
      });
    }

    if (!pin) {
      return res.status(400).json({
        errorType: 'ValidationError',
        errorMessage: 'Missing pin. Query param ya JSON body me pin provide karein.',
      });
    }

    // Generate dynamic TOTP from secret if not provided directly
    if (!totp) {
      if (!totpSecret) {
        return res.status(400).json({
          errorType: 'ValidationError',
          errorMessage: 'Missing totpSecret. Request body me "totpSecret" provide karein.',
        });
      }
      try {
        totp = generateTOTP(totpSecret);
      } catch (err) {
        return res.status(400).json({
          errorType: 'TotpGenerationError',
          errorMessage: `Failed to generate TOTP: ${err.message}`,
        });
      }
    }

    console.log(`[AUTH] Calling Dhan API for Client ID: ${dhanClientId}, Generated TOTP: ${totp}`);

    // Call Dhan Generate Access Token API
    const dhanApiUrl = `${AUTH_BASE_URL}/app/generateAccessToken`;

    const response = await axios.post(
      dhanApiUrl,
      null, // Empty body as Dhan expects query params
      {
        params: {
          dhanClientId: dhanClientId.toString().trim(),
          pin: pin.toString().trim(),
          totp: totp.toString().trim(),
        },
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('[AUTH] Dhan API Success for Client ID:', response.data?.dhanClientId);

    // Return the exact JSON response from Dhan directly
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[AUTH ERROR]:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || {
      errorType: 'InternalError',
      errorMessage: error.message || 'Authentication failed',
    };

    return res.status(statusCode).json(errorData);
  }
}

module.exports = {
  generateAccessToken,
};
