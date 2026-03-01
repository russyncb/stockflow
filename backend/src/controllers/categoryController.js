const pool = require('../db/pool');

const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addCategory = async (req, res) => {
  const { name } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
      [String(name).trim()]
    );
    res.status(201).json({ message: 'Category created', category: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A category with this name already exists.' });
    }
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAllCategories, addCategory };
