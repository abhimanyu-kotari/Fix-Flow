const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber');
const env = require('../config/env');

const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * Normalizes any valid phone number into standard E.164 format.
 * Uses configurable default region (defaults to 'IN' if unspecified).
 * 
 * @param {string} rawInput - e.g. "9876543210", "+91 98765 43210", "09876543210", "+1 (555) 234-5678"
 * @param {string} [defaultRegion] - ISO 3166-1 alpha-2 country code (e.g. 'IN', 'US', 'GB')
 * @returns {{
 *   isValid: boolean,
 *   e164?: string,
 *   national?: string,
 *   international?: string,
 *   countryCode?: number,
 *   regionCode?: string,
 *   error?: string
 * }}
 */
function normalizePhone(rawInput, defaultRegion = env.DEFAULT_COUNTRY_CODE) {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      error: 'Phone number string is required.'
    };
  }

  const trimmed = rawInput.trim();
  if (trimmed.length < 5) {
    return {
      isValid: false,
      error: 'Phone number is too short to be valid.'
    };
  }

  const region = (defaultRegion || 'IN').toUpperCase();

  try {
    const parsedNumber = phoneUtil.parseAndKeepRawInput(trimmed, region);
    const isValid = phoneUtil.isValidNumber(parsedNumber);

    if (!isValid) {
      return {
        isValid: false,
        error: 'Phone number is not a valid international or national phone number.'
      };
    }

    const e164 = phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);
    const national = phoneUtil.format(parsedNumber, PhoneNumberFormat.NATIONAL);
    const international = phoneUtil.format(parsedNumber, PhoneNumberFormat.INTERNATIONAL);
    const countryCode = parsedNumber.getCountryCode();
    const regionCode = phoneUtil.getRegionCodeForNumber(parsedNumber);

    return {
      isValid: true,
      e164,
      national,
      international,
      countryCode,
      regionCode
    };
  } catch (err) {
    return {
      isValid: false,
      error: `Failed to parse phone number: ${err.message}`
    };
  }
}

/**
 * Quick boolean checker for phone number validity.
 * @param {string} rawInput 
 * @param {string} [defaultRegion] 
 * @returns {boolean}
 */
function isValidPhone(rawInput, defaultRegion = env.DEFAULT_COUNTRY_CODE) {
  const result = normalizePhone(rawInput, defaultRegion);
  return result.isValid;
}

/**
 * Returns strictly formatted E.164 string or throws an error.
 * @param {string} rawInput 
 * @param {string} [defaultRegion] 
 * @returns {string} E.164 string like '+919876543210'
 */
function formatE164(rawInput, defaultRegion = env.DEFAULT_COUNTRY_CODE) {
  const result = normalizePhone(rawInput, defaultRegion);
  if (!result.isValid) {
    throw new Error(result.error || 'Invalid phone number');
  }
  return result.e164;
}

module.exports = {
  normalizePhone,
  isValidPhone,
  formatE164
};
