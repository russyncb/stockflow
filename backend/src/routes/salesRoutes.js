const express = require('express');
const router = express.Router();
const { processSale } = require('../controllers/salesController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/sales - Open to logged-in Staff and Admin 
router.post('/', authenticateToken, processSale);

module.exports = router;