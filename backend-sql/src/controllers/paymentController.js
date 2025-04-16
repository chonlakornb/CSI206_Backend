import { pool } from '../config/db.js';

export const processPayment = async (req, res) => {
  const { order_id, payment_method, amount } = req.body;

  try {
    // Role-based authorization
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Forbidden: Only customers can make payments.' });
    }

    // Check if the order exists and belongs to the user
    const [order] = await pool.query('SELECT * FROM orders WHERE order_id = ? AND user_id = ?', [order_id, req.user.id]);
    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found or does not belong to the user.' });
    }

    // Check if the payment amount matches the order total
    if (parseFloat(amount) !== parseFloat(order[0].total_price)) {
      return res.status(400).json({ message: 'Payment amount does not match the order total.' });
    }

    // Process the payment (mock payment processing)
    // In a real-world scenario, integrate with a payment gateway here

    // Update the order status to "paid"
    await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', ['paid', order_id]);

    // Record the payment in the payments table
    await pool.query(
      'INSERT INTO payments (order_id, user_id, payment_method, amount, created_at) VALUES (?, ?, ?, ?, NOW())',
      [order_id, req.user.id, payment_method, amount]
    );

    res.status(201).json({ message: 'Payment processed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentByOrderId = async (req, res) => {
  try {
    // Role-based authorization
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Forbidden: Only customers can view payment details.' });
    }

    // Fetch payment details for the specified order_id
    const [payment] = await pool.query(
      'SELECT * FROM payments WHERE order_id = ? AND user_id = ?',
      [req.params.order_id, req.user.id]
    );

    if (payment.length === 0) {
      return res.status(404).json({ message: 'Payment not found for this order.' });
    }

    res.json(payment[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { status } = req.body;

  try {
    // Role-based authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admins can update payment status.' });
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${validStatuses.join(', ')}` });
    }

    // Check if the payment exists
    const [payment] = await pool.query('SELECT * FROM payments WHERE payment_id = ?', [req.params.id]);
    if (payment.length === 0) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    // Update the payment status
    await pool.query('UPDATE payments SET status = ? WHERE payment_id = ?', [status, req.params.id]);
    res.json({ message: 'Payment status updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
