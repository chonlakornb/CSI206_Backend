import { pool } from '../config/db.js';

export const getSellers = async (req, res) => {
  try {
    const [sellers] = await pool.query('SELECT user_id, name, email, phone FROM users WHERE role = ?', ['seller']);
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSellerById = async (req, res) => {
  const { id } = req.params;

  try {
    const [sellers] = await pool.query(
      'SELECT user_id, name, email, phone FROM users WHERE user_id = ? AND role = ?',
      [id, 'seller']
    );
    if (sellers.length === 0) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(sellers[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSellerById = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    const [sellers] = await pool.query('SELECT * FROM users WHERE user_id = ? AND role = ?', [id, 'seller']);
    if (sellers.length === 0) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE user_id = ? AND role = ?',
      [name || sellers[0].name, email || sellers[0].email, phone || sellers[0].phone, id, 'seller']
    );

    res.json({ message: 'Seller account updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSellerById = async (req, res) => {
  const { id } = req.params;

  try {
    const [sellers] = await pool.query('SELECT * FROM users WHERE user_id = ? AND role = ?', [id, 'seller']);
    if (sellers.length === 0) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    await pool.query('DELETE FROM users WHERE user_id = ? AND role = ?', [id, 'seller']);
    res.json({ message: 'Seller account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
