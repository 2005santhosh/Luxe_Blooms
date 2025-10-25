const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { customerName, phone, address, cartItems, totalPrice } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart items required' });
    }
    const order = new Order({ customerName, phone, address, cartItems, totalPrice });
    await order.save();
    res.json({ success: true, message: 'Your order has been placed! We’ll contact you soon.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};