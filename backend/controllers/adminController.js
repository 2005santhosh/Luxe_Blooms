const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Admin = require('../models/Admin');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.adminId = admin._id;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkAuth = (req, res) => {
  if (req.session.adminId) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

exports.addProduct = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    if (!imageUrl) return res.status(400).json({ error: 'Image required' });

    const product = new Product({ name, category, price, description, imageUrl });
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description } = req.body;
    const updateData = { name, category, price, description };
    if (req.file) {
      // Delete old image
      const oldProduct = await Product.findById(id);
      if (oldProduct && oldProduct.imageUrl) {
        const oldImagePath = path.join(__dirname, '../uploads', path.basename(oldProduct.imageUrl));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Delete image
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, '../uploads', path.basename(product.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductByName = async (req, res) => {
  try {
    const { name } = req.query;
    const product = await Product.findOne({ name: { $regex: name, $options: 'i' } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};