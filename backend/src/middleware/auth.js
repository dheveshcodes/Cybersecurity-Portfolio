/**
 * Simple JWT-based auth middleware.
 * Clients authenticate by signing a nonce with their wallet (see /routes/access.js
 * for the sign-in flow) and receive a JWT tied to their wallet address.
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = { address: decoded.address };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
