import { pool } from '../config/db.js';

export const getShippingStatus = async (req, res) => {
  const { order_id } = req.params;

  try {
    // Query the shipping status for the given order_id
    const [shipping] = await pool.query(
      `SELECT s.shipping_id, s.order_id, s.address_id, s.status, 
              a.street_address, a.province, a.postal_code, a.country, 
              u.phone AS user_phone
       FROM shipping s
       JOIN address a ON s.address_id = a.address_id
       JOIN users u ON a.user_id = u.user_id
       WHERE s.order_id = ?`,
      [order_id]
    );

    if (shipping.length === 0) {
      return res.status(404).json({ message: 'Shipping information not found for the given order' });
    }

    res.json(shipping[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShipping = async (req, res) => {
  const { order_id, address_id } = req.body;

  try {
    // Check if the order exists
    const [order] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [order_id]);
    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If address_id is provided, validate it
    if (address_id) {
      const [address] = await pool.query('SELECT * FROM address WHERE address_id = ?', [address_id]);
      if (address.length === 0) {
        return res.status(404).json({ message: 'Address not found' });
      }

      // Allow admins to use any address_id
      if (req.user.role !== 'admin') {
        // Ensure the address belongs to the authenticated user
        const [userAddress] = await pool.query(
          'SELECT * FROM address WHERE address_id = ? AND user_id = ?',
          [address_id, req.user.id]
        );
        if (userAddress.length === 0) {
          return res.status(403).json({ message: 'Access denied. Address does not belong to the user.' });
        }
      }
    }

    // Create a new shipping record
    const [result] = await pool.query(
      'INSERT INTO shipping (order_id, address_id, status) VALUES (?, ?, ?)',
      [order_id, address_id || null, 'preparing']
    );

    // Fetch the user's phone number for the response
    const [user] = await pool.query(
      `SELECT u.phone AS user_phone 
       FROM users u 
       JOIN address a ON a.user_id = u.user_id 
       WHERE a.address_id = ?`,
      [address_id]
    );

    res.status(201).json({
      message: 'Shipping record created successfully',
      shipping: {
        shipping_id: result.insertId,
        order_id,
        address_id: address_id || null,
        status: 'preparing',
        user_phone: user.length > 0 ? user[0].user_phone : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShippingStatus = async (req, res) => {
  const { id } = req.params; // Shipping ID
  const { status } = req.body;

  try {
    // Validate the user's role (only admin or seller can update shipping status)
    if (!['admin', 'seller'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only admins or sellers can update shipping status.' });
    }

    // Validate the status value
    const validStatuses = ['preparing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${validStatuses.join(', ')}` });
    }

    // Check if the shipping record exists
    const [shipping] = await pool.query('SELECT * FROM shipping WHERE shipping_id = ?', [id]);
    if (shipping.length === 0) {
      return res.status(404).json({ message: 'Shipping record not found' });
    }

    // Update the shipping status
    await pool.query('UPDATE shipping SET status = ? WHERE shipping_id = ?', [status, id]);

    res.json({ message: 'Shipping status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
