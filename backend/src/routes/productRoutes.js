const express = require('express');
const router = express.Router();
// Added updateProduct and deleteProduct to the imports
const { 
  addProduct, 
  getAllProducts, 
  restockProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// GET /api/products - Open to logged-in Staff and Admin
router.get('/', authenticateToken, getAllProducts);

// POST /api/products - Restricted to Admin ONLY
router.post('/', authenticateToken, isAdmin, addProduct);

// PUT /api/products/:id/restock - Restricted to Admin ONLY
router.put('/:id/restock', authenticateToken, isAdmin, restockProduct);

// PUT /api/products/:id - Restricted to Admin ONLY (Edit details)
router.put('/:id', authenticateToken, isAdmin, updateProduct);

// DELETE /api/products/:id - Restricted to Admin ONLY
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

module.exports = router;