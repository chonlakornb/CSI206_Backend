import { pool } from '../config/db.js';

export const getShippingStatus = async (req, res) => {
  const { order_id } = req.params;

  try {
    const [shipping] = await pool.query(
      'SELECT order_id, status, estimated_delivery FROM shipping WHERE order_id = ?',
      [order_id]
    );

    if (shipping.length === 0) {
      return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });
    }

    res.json(shipping[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
