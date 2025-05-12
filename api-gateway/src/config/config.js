require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  services: {
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3003',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '1h'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
}; 