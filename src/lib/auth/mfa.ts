import { TOTP, ScureBase32Plugin, NobleCryptoPlugin } from 'otplib';
import QRCode from 'qrcode';

// Configure otplib
const authenticator = new TOTP({
  base32: new ScureBase32Plugin(),
  crypto: new NobleCryptoPlugin(),
});

/**
 * Generate a new TOTP secret for a user
 */
export function generateMfaSecret() {
  return authenticator.generateSecret();
}

/**
 * Generate a QR code data URI for the user to scan
 * @param email User's email (used as the label)
 * @param secret The MFA secret
 * @param appName The name of the application
 */
export async function generateMfaQrCode(email: string, secret: string, appName: string = 'MasterTemplate') {
  const otpauthUrl = authenticator.toURI({
    label: email,
    issuer: appName,
    secret,
  });
  return await QRCode.toDataURL(otpauthUrl);
}

/**
 * Verify a 6-digit TOTP token against the user's secret
 * @param token The 6-digit string
 * @param secret The MFA secret
 */
export async function verifyMfaToken(token: string, secret: string) {
  try {
    return await authenticator.verify(token, { secret });
  } catch (err) {
    return false;
  }
}
