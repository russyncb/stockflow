const pool = require('../db/pool');

// ADMIN ONLY: Get full system overview
const getAdminSummary = async (req, res) => {
  try {
    // 1. Total Products
    const totalProductsRes = await pool.query('SELECT COUNT(*) FROM products');
    const totalProducts = parseInt(totalProductsRes.rows[0].count);

    // 2. Total Inventory Value
    const inventoryValueRes = await pool.query('SELECT SUM(price * stock_quantity) AS total_value FROM products');
    const totalInventoryValue = parseFloat(inventoryValueRes.rows[0].total_value) || 0;

    // 3. Low Stock Products
    const lowStockRes = await pool.query('SELECT id, name, stock_quantity, low_stock_threshold FROM products WHERE stock_quantity <= low_stock_threshold');
    const lowStockProducts = lowStockRes.rows;

    // 4. Total Sales Today
    const salesTodayRes = await pool.query('SELECT SUM(total_amount) AS today_sales FROM sales WHERE DATE(created_at) = CURRENT_DATE');
    const totalSalesToday = parseFloat(salesTodayRes.rows[0].today_sales) || 0;

    // 5. Recent Stock Movements
    const recentMovementsRes = await pool.query(`
      SELECT sm.id, p.name AS product_name, u.username, sm.type, sm.quantity_changed, sm.timestamp 
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      JOIN users u ON sm.user_id = u.id
      ORDER BY sm.timestamp DESC
      LIMIT 10
    `);
    const recentMovements = recentMovementsRes.rows;

    res.json({
      totalProducts,
      totalInventoryValue,
      totalSalesToday,
      lowStockProducts,
      recentMovements
    });

  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// STAFF & ADMIN: Get data for the Sales Interface (POS)
const getStaffDashboard = async (req, res) => {
  try {
    // Fetch available products list (only items in stock)
    const availableProductsRes = await pool.query(`
      SELECT id, name, price, stock_quantity 
      FROM products 
      WHERE stock_quantity > 0 
      ORDER BY name ASC
    `);
    
    res.json({
      availableProducts: availableProductsRes.rows
    });
  } catch (error) {
    console.error('Error fetching staff dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export BOTH functions
module.exports = { getAdminSummary, getStaffDashboard };