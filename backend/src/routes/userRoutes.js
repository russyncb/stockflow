const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  updateUserRole, 
  resetUserPassword, 
  deleteUser 
} = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// All routes here require the user to be logged in AND be an Admin
router.get('/', authenticateToken, isAdmin, getAllUsers);
router.put('/:id/role', authenticateToken, isAdmin, updateUserRole);
router.put('/:id/password', authenticateToken, isAdmin, resetUserPassword);
router.delete('/:id', authenticateToken, isAdmin, deleteUser);

module.exports = router;