const Product = require('../models/Product');
const logger = require('../utils/logger');
const { publishEvent } = require('../services/kafka.service');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      logger.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      logger.error('Error fetching product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createProduct(req, res) {
    try {
      const product = new Product(req.body);
      await product.save();
      
      await publishEvent('product-updates', {
        type: 'PRODUCT_CREATED',
        product
      });
      
      res.status(201).json(product);
    } catch (error) {
      logger.error('Error creating product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      await publishEvent('product-updates', {
        type: 'PRODUCT_UPDATED',
        product
      });
      
      res.json(product);
    } catch (error) {
      logger.error('Error updating product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      await publishEvent('product-updates', {
        type: 'PRODUCT_DELETED',
        productId: req.params.id
      });
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      logger.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ProductController(); 