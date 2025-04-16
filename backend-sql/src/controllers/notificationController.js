import { pool } from '../config/db.js';

export const getNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query('SELECT * FROM notifications WHERE user_id = ?', [req.user.id]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addNotification = async (req, res) => {
  const { user_id, message, status } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, message, status) VALUES (?, ?, ?)',
      [user_id, message, status]
    );
    res.status(201).json({
      message: 'Notification added successfully',
      notification: { id: result.insertId, user_id, message, status },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotificationById = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
