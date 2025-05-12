require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const routes = require('./routes/product.routes');
const logger = require('./utils/logger');
const { startKafkaProducer, startKafkaConsumer } = require('./services/kafka.service');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(config.mongodb.uri)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use(routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(config.port, async () => {
  logger.info(`Product service running on port ${config.port}`);
  try {
    await startKafkaProducer();
    await startKafkaConsumer();
  } catch (error) {
    logger.error('Error starting Kafka:', error);
    process.exit(1);
  }
}); 