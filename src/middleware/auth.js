const { verifyToken } = require('../utils/crypto');
const { User } = require('../models');

async function authenticateRepairer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Please provide a valid Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);

    if (decoded.type !== 'repairer') {
      return res.status(403).json({
        error: 'Access denied. Token is not authorized for repairer operations.'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Account not found or has been deactivated.'
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      workspaceId: user.workspace.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.workspaceId = user.workspace.toString();

    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired session token. Please log in again.'
    });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`
      });
    }

    next();
  };
}

module.exports = {
  authenticateRepairer,
  requireRole
};
