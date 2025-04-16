import { pool } from '../config/db.js';

export const getRecommendations = async (req, res) => {
  try {
    const [recommendations] = await pool.query(
      'SELECT r.*, b.title, b.author FROM recommendations r JOIN books b ON r.book_id = b.id WHERE r.user_id = ?',
      [req.user.id]
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRecommendation = async (req, res) => {
  const { book_id, reason } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO recommendations (user_id, book_id, reason) VALUES (?, ?, ?)',
      [req.user.id, book_id, reason]
    );
    res.status(201).json({
      message: 'Recommendation added successfully',
      recommendation: { id: result.insertId, user_id: req.user.id, book_id, reason },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecommendationById = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM recommendations WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    res.json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
