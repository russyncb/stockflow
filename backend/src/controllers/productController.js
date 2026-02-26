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

// ADMIN: Restock an existing product
const restockProduct = async (req, res) => {
    const { id } = req.params; // Grabs the product ID from the URL (e.g., /api/products/1/restock)
    const { quantity } = req.body; // Grabs the amount to add from the JSON body
    const user_id = req.user.id; // Identifies who is restocking
  
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Please provide a valid quantity to add.' });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // 1. Increase the stock quantity
      const productRes = await client.query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2 RETURNING *',
        [quantity, id]
      );
  
      if (productRes.rows.length === 0) {
        throw new Error('Product not found.');
      }
  
      // 2. Log the stock movement (Notice the positive quantity for a restock!)
      await client.query(
        'INSERT INTO stock_movements (product_id, user_id, type, quantity_changed) VALUES ($1, $2, $3, $4)',
        [id, user_id, 'RESTOCK', quantity]
      );
  
      await client.query('COMMIT');
      res.json({ message: 'Stock replenished successfully', product: productRes.rows[0] });
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Restock transaction failed:', error.message);
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  };

module.exports = { addProduct, getAllProducts, restockProduct };