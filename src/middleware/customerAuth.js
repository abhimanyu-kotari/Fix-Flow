const { verifyToken } = require('../utils/crypto');
const { Customer } = require('../models');

async function authenticateCustomer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Please verify your phone number with an OTP code.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);

    if (decoded.type !== 'customer') {
      return res.status(403).json({
        error: 'Access denied. Token is not authorized for customer portal operations.'
      });
    }

    const customer = await Customer.findById(decoded.customerId);
    if (!customer) {
      return res.status(401).json({
        error: 'Customer account not found.'
      });
    }

    req.customer = {
      id: customer._id.toString(),
      _id: customer._id,
      phone: customer.phoneE164,
      name: customer.defaultName,
      isVerified: customer.isVerified
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Session expired or invalid. Please request a new verification code.'
    });
  }
}

module.exports = {
  authenticateCustomer
};
