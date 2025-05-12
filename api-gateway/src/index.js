require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const proxy = require('express-http-proxy');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 4000;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Service URLs
const SERVICES = {
  PRODUCT: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
  ORDER: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
  USER: process.env.USER_SERVICE_URL || 'http://localhost:3003',
  PAYMENT: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004'
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Forward the token to the user service for validation
  req.headers['x-auth-token'] = token;
  next();
};

// Routes
app.use('/api/products', authenticateToken, proxy(SERVICES.PRODUCT));
app.use('/api/orders', authenticateToken, proxy(SERVICES.ORDER));
app.use('/api/users', proxy(SERVICES.USER));
app.use('/api/payments', authenticateToken, proxy(SERVICES.PAYMENT));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
}); 