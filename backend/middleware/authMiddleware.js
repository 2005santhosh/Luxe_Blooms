const requireAuth = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }
  next();
};

module.exports = { requireAuth };