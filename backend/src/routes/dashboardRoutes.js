const express = require('express');
const router = express.Router();
// Import both functions now
const { getAdminSummary, getStaffDashboard } = require('../controllers/dashboardController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// GET /api/dashboard/admin - Restricted to Admin ONLY
router.get('/admin', authenticateToken, isAdmin, getAdminSummary);

// GET /api/dashboard/staff - Open to logged-in Staff (and Admin)
router.get('/staff', authenticateToken, getStaffDashboard);

module.exports = router;