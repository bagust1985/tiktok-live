/**
 * OTP Generation and Validation Utility
 */

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '15');
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5');

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  // Generate random 6-digit number (000000 - 999999)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

/**
 * Calculate OTP expiry date
 */
export function getOTPExpiryDate(): Date {
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiryDate;
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Check if attempts exceeded maximum
 */
export function isAttemptsExceeded(attempts: number): boolean {
  return attempts >= OTP_MAX_ATTEMPTS;
}

/**
 * Validate OTP code format (must be 6 digits)
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

export { OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS };

