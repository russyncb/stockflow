const pool = require('../db/pool');
const bcrypt = require('bcrypt');

// ADMIN ONLY: View all users (hiding passwords for security)
const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ADMIN ONLY: Change a user's role (e.g., promote Staff to Admin)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== 'Admin' && role !== 'Staff') {
    return res.status(400).json({ error: 'Invalid role. Must be Admin or Staff.' });
  }

  try {
    const updated = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role',
      [role, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User role updated successfully', user: updated.rows[0] });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ADMIN ONLY: Reset a user's password
const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    // Hash the new password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    const updated = await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username',
      [hashedPassword, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: `Password reset successfully for user: ${updated.rows[0].username}` });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ADMIN ONLY: Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await pool.query('DELETE FROM users WHERE id = $1 RETURNING username', [id]);
    
    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: `User ${deleted.rows[0].username} deleted successfully` });
  } catch (error) {
    // Foreign Key Violation check (If the user processed sales, you can't just delete them!)
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: 'Cannot delete this user because they are tied to past sales or stock movements. Consider changing their password and role to lock them out instead.' 
      });
    }
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAllUsers, updateUserRole, resetUserPassword, deleteUser };