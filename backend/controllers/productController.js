const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, page = 0, limit = 12 } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    const skip = parseInt(page) * parseInt(limit);
    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};