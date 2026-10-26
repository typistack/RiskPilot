const OTPAuth = require('otpauth');

/**
 * Generate 6-digit Time-based OTP using Base32 Secret Key
 * @param {string} secretKey
 * @returns {string} 6-digit TOTP
 */
function generateTOTP(secretKey) {
  if (!secretKey) {
    throw new Error('TOTP secret key is required');
  }

  // Clean secret key (remove spaces/dashes and convert to uppercase)
  const cleanSecret = secretKey.replace(/[\s-]/g, '').toUpperCase();

  const totp = new OTPAuth.TOTP({
    issuer: 'Dhan',
    label: 'DhanHQ',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(cleanSecret),
  });

  return totp.generate();
}

module.exports = {
  generateTOTP,
};
