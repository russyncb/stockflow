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

// ADMIN ONLY: Update product details (Name, Description, Price)
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
  
    try {
      const updated = await pool.query(
        'UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *',
        [name, description, price, id]
      );
  
      if (updated.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      
      res.json({ message: 'Product updated successfully', product: updated.rows[0] });
    } catch (error) {
      console.error('Error updating product:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // ADMIN ONLY: Delete a product entirely
  const deleteProduct = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deleted = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      
      if (deleted.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }
  
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      // PostgreSQL error code 23503 is a Foreign Key Violation
      // This stops you from deleting a product if it is tied to past sales receipts!
      if (error.code === '23503') {
        return res.status(400).json({ 
          error: 'Cannot delete this product because it exists in past sales records. Try updating the stock to 0 instead to keep your accounting accurate.' 
        });
      }
      console.error('Error deleting product:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

module.exports = { addProduct, getAllProducts, restockProduct, updateProduct, deleteProduct };