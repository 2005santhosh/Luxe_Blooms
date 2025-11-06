// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const feedbackController = require('../controllers/feedbackController');

// Product routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Feedback routes
router.get('/:productId/feedbacks', feedbackController.getProductFeedbacks);
router.post('/:productId/feedbacks', feedbackController.addFeedback);

module.exports = router;