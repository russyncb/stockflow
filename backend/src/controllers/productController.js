const pool = require('../db/pool');

// ADMIN ONLY: Add a new product
const addProduct = async (req, res) => {
  const { name, description, price, stock_quantity, category_id } = req.body;

  try {
    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, stock_quantity, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, stock_quantity || 0, category_id || null]
    );
    res.status(201).json({ message: 'Product added successfully', product: newProduct.rows[0] });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ADMIN & STAFF: View all products
const getAllProducts = async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(products.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { addProduct, getAllProducts };