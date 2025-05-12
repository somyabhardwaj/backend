const { Kafka } = require('kafkajs');
const config = require('../config/config');
const logger = require('../utils/logger');

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'product-group' });

async function startKafkaProducer() {
  try {
    await producer.connect();
    logger.info('Kafka producer connected');
  } catch (error) {
    logger.error('Error connecting Kafka producer:', error);
    throw error;
  }
}

async function startKafkaConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'product-updates', fromBeginning: true });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        logger.info('Received message:', event);
        
        // Handle different event types
        switch (event.type) {
          case 'ORDER_CREATED':
            // Update product stock
            await Product.findByIdAndUpdate(
              event.productId,
              { $inc: { stock: -event.quantity } }
            );
            break;
          case 'ORDER_CANCELLED':
            // Restore product stock
            await Product.findByIdAndUpdate(
              event.productId,
              { $inc: { stock: event.quantity } }
            );
            break;
        }
      },
    });
  } catch (error) {
    logger.error('Error starting Kafka consumer:', error);
    throw error;
  }
}

async function publishEvent(topic, message) {
  try {
    await producer.send({
      topic,
      messages: [
        { value: JSON.stringify(message) }
      ]
    });
  } catch (error) {
    logger.error('Error publishing event:', error);
    throw error;
  }
}

module.exports = {
  startKafkaProducer,
  startKafkaConsumer,
  publishEvent
}; 