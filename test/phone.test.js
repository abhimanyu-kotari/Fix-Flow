const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { normalizePhone, isValidPhone, formatE164 } = require('../src/utils/phone');

describe('Phone Number Normalization & Validation (E.164)', () => {
  test('normalizes 10-digit Indian local phone number', () => {
    const res = normalizePhone('9876543210', 'IN');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
    assert.equal(res.countryCode, 91);
    assert.equal(res.regionCode, 'IN');
  });

  test('normalizes Indian phone number with leading zero', () => {
    const res = normalizePhone('09876543210', 'IN');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
  });

  test('normalizes formatted phone number with spaces and hyphens', () => {
    const res = normalizePhone('+91 98765-43210', 'IN');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
  });

  test('normalizes international numbers (e.g. US / UK) when international prefix provided', () => {
    const usRes = normalizePhone('+1 415 555 2671', 'IN');
    assert.equal(usRes.isValid, true);
    assert.equal(usRes.e164, '+14155552671');
    assert.equal(usRes.countryCode, 1);
    assert.equal(usRes.regionCode, 'US');

    const ukRes = normalizePhone('+44 20 7946 0958', 'IN');
    assert.equal(ukRes.isValid, true);
    assert.equal(ukRes.e164, '+442079460958');
    assert.equal(ukRes.countryCode, 44);
    assert.equal(ukRes.regionCode, 'GB');
  });

  test('normalizes US numbers with default region US', () => {
    const res = normalizePhone('(415) 555-2671', 'US');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+14155552671');
  });

  test('handles whitespace and brackets cleanly', () => {
    const res = normalizePhone('   (98765) 43210   ', 'IN');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
  });

  test('rejects invalid, short, or alphabetical input', () => {
    assert.equal(isValidPhone('123', 'IN'), false);
    assert.equal(isValidPhone('abcdefghij', 'IN'), false);
    assert.equal(isValidPhone('', 'IN'), false);
    assert.equal(isValidPhone(null, 'IN'), false);
  });

  test('formatE164 returns valid E.164 string or throws on invalid', () => {
    assert.equal(formatE164('9876543210'), '+919876543210');
    assert.throws(() => formatE164('invalid-phone'), {
      message: /Failed to parse phone number|Phone number is not a valid/
    });
  });
});
