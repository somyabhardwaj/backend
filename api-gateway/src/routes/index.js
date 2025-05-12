const express = require('express');
const proxy = require('express-http-proxy');
const { authenticateToken } = require('../middlewares/auth.middleware');
const config = require('../config/config');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway' });
});

// Service routes with authentication
router.use('/api/products', authenticateToken, proxy(config.services.product));
router.use('/api/orders', authenticateToken, proxy(config.services.order));
router.use('/api/users', proxy(config.services.user));
router.use('/api/payments', authenticateToken, proxy(config.services.payment));

module.exports = router; 