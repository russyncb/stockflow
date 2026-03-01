const express = require('express');
const router = express.Router();
const { processSale, getSales } = require('../controllers/salesController');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/sales - List recent sales (for dashboard)
router.get('/', authenticateToken, getSales);

// POST /api/sales - Open to logged-in Staff and Admin
router.post('/', authenticateToken, processSale);

module.exports = router;