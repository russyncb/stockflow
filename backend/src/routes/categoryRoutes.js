const express = require('express');
const router = express.Router();
const { getAllCategories, addCategory } = require('../controllers/categoryController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getAllCategories);
router.post('/', authenticateToken, isAdmin, addCategory);

module.exports = router;
