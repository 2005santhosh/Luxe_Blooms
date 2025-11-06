const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files for assets folder - with debugging
const assetsPath = path.join(__dirname,'..', 'assets');
console.log('Assets path:', assetsPath); // Debug log

// Check if assets directory exists
if (!fs.existsSync(assetsPath)) {
  console.log('Assets directory does not exist at:', assetsPath);
  // Create the directory if it doesn't exist
  fs.mkdirSync(assetsPath, { recursive: true });
  console.log('Created assets directory at:', assetsPath);
} else {
  console.log('Assets directory exists at:', assetsPath);
  // List files in the directory
  const files = fs.readdirSync(assetsPath);
  console.log('Files in assets directory:', files);
}

app.use('/assets', express.static(assetsPath));

// Serve static files for user site
app.use(express.static(path.join(__dirname, '../user-site')));

// Serve static files for admin site under /admin
app.use('/admin', express.static(path.join(__dirname, '../admin-site')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// Admin catch-all (with extension check for proper 404 on missing static files)
app.get('/admin/*', (req, res) => {
  // If the path has a file extension, treat as static request and 404 if not found (static middleware already checked)
  if (req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
    return res.status(404).send('File not found');
  }
  // Otherwise, serve admin dashboard for SPA routing
  res.sendFile(path.join(__dirname, '../admin-site/dashboard.html'));
});

// Catch-all for user site SPA-like routing (with extension check)
app.get('*', (req, res) => {
  // If the path has a file extension, treat as static request and 404 if not found (static middleware already checked)
  if (req.path.match(/\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
    return res.status(404).send('File not found');
  }
  // Otherwise, serve user index for SPA routing
  res.sendFile(path.join(__dirname, '../user-site/index.html'));
});

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    // Seed default admin if not exists
    const Admin = require('./models/Admin');
    Admin.findOne({ email: 'luxe@admin' })
      .then(admin => {
        if (!admin) {
          const bcrypt = require('bcryptjs');
          const passwordHash = bcrypt.hashSync('luxe@2025', 10);
          new Admin({ email: 'luxe@admin', passwordHash }).save()
            .then(() => console.log('Default admin created: luxe@admin / luxe@2025'))
            .catch(err => console.error('Error creating default admin:', err));
        }
      });
  })
  .catch(err => console.error('MongoDB Atlas connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});