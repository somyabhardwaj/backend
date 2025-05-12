const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { validateProduct } = require('../middlewares/validation.middleware');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'product-service' });
});

// Product routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', validateProduct, productController.createProduct);
router.put('/products/:id', validateProduct, productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

module.exports = router; 