const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 * @param {string} password 
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Compare plain text password against hashed password
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT token with FixFlow secret
 * @param {object} payload 
 * @param {string} [expiresIn] 
 * @returns {string}
 */
function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param {string} token 
 * @returns {object}
 */
function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken
};
