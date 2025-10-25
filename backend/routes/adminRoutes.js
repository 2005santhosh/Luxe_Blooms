const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { requireAuth } = require('../middleware/authMiddleware');
const {
  login, checkAuth, logout, addProduct, getAllProductsAdmin,
  updateProduct, deleteProduct, getProductByName
} = require('../controllers/adminController');

const router = express.Router();

router.post('/login', login);
router.get('/check-auth', checkAuth);
router.post('/logout', logout);

router.use(requireAuth); // Protect following routes

router.post('/add-product', upload.single('image'), addProduct);
router.get('/products', getAllProductsAdmin);
router.post('/products/:id/update', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products/search', getProductByName);

module.exports = router;