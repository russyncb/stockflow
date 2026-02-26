const pool = require('../db/pool');

const processSale = async (req, res) => {
  // We expect an array of items from the frontend, e.g., [{ product_id: 1, quantity: 2 }]
  const { items } = req.body; 
  const user_id = req.user.id; // From your JWT authMiddleware

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items provided for the sale.' });
  }

  // Grab a dedicated client from the pool to run our Transaction
  const client = await pool.connect();

  try {
    // Start the transaction
    await client.query('BEGIN');

    let totalAmount = 0;

    // 1. Verify stock availability and calculate the total amount
    for (let item of items) {
      const productRes = await client.query('SELECT price, stock_quantity FROM products WHERE id = $1', [item.product_id]);
      
      if (productRes.rows.length === 0) {
        throw new Error(`Product ID ${item.product_id} does not exist.`);
      }
      
      const product = productRes.rows[0];
      
      if (product.stock_quantity < item.quantity) {
         throw new Error(`Insufficient stock for Product ID ${item.product_id}. Only ${product.stock_quantity} left.`);
      }
      
      // Temporarily store the price to use when inserting into sale_items
      item.price = product.price; 
      totalAmount += (product.price * item.quantity);
    }

    // 2. Create the main sale record [cite: 27]
    const saleResult = await client.query(
      'INSERT INTO sales (user_id, total_amount) VALUES ($1, $2) RETURNING id',
      [user_id, totalAmount]
    );
    const sale_id = saleResult.rows[0].id;

    // 3. Process each item: record sale item, reduce stock, and log movement
    for (let item of items) {
      // A. Insert into sale_items [cite: 47]
      await client.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [sale_id, item.product_id, item.quantity, item.price]
      );

      // B. Reduce product stock [cite: 27]
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );

      // C. Log the stock movement (Notice the negative quantity for a sale!) [cite: 41, 48]
      await client.query(
        'INSERT INTO stock_movements (product_id, user_id, type, quantity_changed) VALUES ($1, $2, $3, $4)',
        [item.product_id, user_id, 'SALE', -item.quantity]
      );
    }

    // If everything succeeded, save it permanently
    await client.query('COMMIT');
    res.status(201).json({ message: 'Sale processed successfully', sale_id, totalAmount });

  } catch (error) {
    // If ANY query fails, undo the whole transaction
    await client.query('ROLLBACK');
    console.error('Transaction failed, rolled back:', error.message);
    res.status(400).json({ error: error.message });
  } finally {
    // Always return the client to the pool so your server doesn't run out of connections
    client.release();
  }
};

module.exports = { processSale };