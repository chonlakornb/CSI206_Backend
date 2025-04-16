import { pool } from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    // Use 'category_id' instead of 'id' in the query
    const [categories] = await pool.query('SELECT category_id AS id, name FROM categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCategory = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the category name already exists
    const [existingCategory] = await pool.query('SELECT * FROM categories WHERE name = ?', [name]);
    if (existingCategory.length > 0) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Insert the new category into the database
    await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);

    res.status(201).json({ message: 'Category added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategoryById = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    // Check if the category exists
    const [categories] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [id]);
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if the new name already exists
    const [existingCategory] = await pool.query('SELECT * FROM categories WHERE name = ? AND category_id != ?', [name, id]);
    if (existingCategory.length > 0) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    // Update the category
    await pool.query('UPDATE categories SET name = ? WHERE category_id = ?', [name || categories[0].name, id]);

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the category exists
    const [categories] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [id]);
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the category
    await pool.query('DELETE FROM categories WHERE category_id = ?', [id]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
