require('dotenv').config();            // ← must be first line
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes   = require('./routes/auth');
const storeRoutes  = require('./routes/store');
const reportRoutes = require('./routes/reports');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',    authRoutes);
app.use('/api/store',   storeRoutes);
app.use('/api/reports', reportRoutes);

// Start
connectDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
});