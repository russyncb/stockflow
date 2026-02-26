const express = require('express');
const router = express.Router();
const { addProduct, getAllProducts, restockProduct } = require('../controllers/productController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// GET /api/products - Open to logged-in Staff and Admin
router.get('/', authenticateToken, getAllProducts);

// POST /api/products - Restricted to Admin ONLY
router.post('/', authenticateToken, isAdmin, addProduct);

// PUT /api/products/:id/restock - Open to logged-in Admin
router.put('/:id/restock', authenticateToken, isAdmin, restockProduct);

module.exports = router;