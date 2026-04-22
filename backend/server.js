require('dotenv').config();            // ← must be first line
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes   = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const productRoutes = require('./routes/product');
const saleRoutes = require('./routes/sale');


const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',    authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);

// Start
connectDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
});