const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
require('dotenv').config();

// Import your database pool (adjust the path if necessary)
const pool = require('./db/pool'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Test the Database Connection
pool.connect()
  .then((client) => {
    console.log('Successfully connected to the StockFlow database!');
    client.release();
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL:', err.stack);
  });

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'StockFlow API is running!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});