const jwt = require('jsonwebtoken');
require('dotenv').config();

//Verify that the user has a valid token
const authenticateToken = (req, res, next) => {
  // Tokens are usually sent in the header like: "Bearer eyJhbGci..."
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Access denied. No token provided.' });

  const token = authHeader.split(' ')[1]; // Splits "Bearer <token>" and grabs the token
  if (!token) return res.status(401).json({ error: 'Access denied. Invalid token format.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attaches the decoded token (id, username, role) to the request
    next(); // Passes control to the next function
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

//Verify that the user is an Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = { authenticateToken, isAdmin };