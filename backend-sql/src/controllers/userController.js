import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    const [users] = await pool.query('SELECT user_id, username, role FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT user_id, username, role FROM users WHERE user_id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : users[0].password;

    await pool.query(
      'UPDATE users SET username = ?, password = ?, role = ? WHERE user_id = ?',
      [username || users[0].username, hashedPassword, role || users[0].role, req.user.id]
    );

    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserById = async (req, res) => {
  const { id } = req.params; // 'id' is the parameter from the route
  const { name, phone, password } = req.body;

  try {
    // Use 'user_id' instead of 'id' in the query
    const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : users[0].password;

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, password = ? WHERE user_id = ?',
      [name || users[0].name, phone || users[0].phone, hashedPassword, id]
    );

    res.json({ message: 'User account updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
