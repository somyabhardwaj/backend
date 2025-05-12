const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    req.headers['x-auth-token'] = token;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = {
  authenticateToken
}; 