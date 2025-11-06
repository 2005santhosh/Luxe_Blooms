// controllers/feedbackController.js
const Feedback = require('../models/Feedback');

// Get all feedbacks for a product
exports.getProductFeedbacks = async (req, res) => {
  try {
    const { productId } = req.params;
    const feedbacks = await Feedback.find({ productId })
      .sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new feedback for a product
// controllers/feedbackController.js
exports.addFeedback = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, rating, comment } = req.body; // Removed email
    
    // Validate input
    if (!name || !rating || !comment) { // Removed email from validation
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const newFeedback = new Feedback({
      productId,
      name,
      rating, // Removed email
      comment
    });
    
    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};