const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import your database pool (adjust the path if necessary)
const pool = require('./src/db/pool'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Test the Database Connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Successfully connected to the StockFlow database!');
    release(); // Return the client back to the pool
  }
});

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'StockFlow API is running!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});