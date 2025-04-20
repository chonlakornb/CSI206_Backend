import { pool } from '../config/db.js';

export const createOrder = async (req, res) => {
  const { address_id } = req.body;

  try {
    // Use req.user.id to get the authenticated user's ID
    const user_id = req.user.id;

    // Validate that the address belongs to the user
    const [address] = await pool.query(
      'SELECT * FROM address WHERE address_id = ? AND user_id = ?',
      [address_id, user_id]
    );

    if (address.length === 0) {
      return res.status(404).json({ message: 'Address not found or does not belong to the user' });
    }

    // Fetch cart items for the user
    const [cartItems] = await pool.query(
      `SELECT c.cart_id, c.book_id, c.quantity, 
              (c.quantity * b.price) AS total_price, b.price AS book_price 
       FROM cart c 
       JOIN books b ON c.book_id = b.book_id 
       WHERE c.user_id = ?`,
      [user_id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Cannot create an order.' });
    }

    // Calculate the total order price
    const totalOrderPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

    // Create a new order
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, address_id, total_price, created_at) VALUES (?, ?, ?, NOW())',
      [user_id, address_id, totalOrderPrice]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    const orderItems = cartItems.map(item => [
      orderId,
      item.book_id,
      item.quantity,
      item.book_price,
      item.total_price,
    ]);

    await pool.query(
      'INSERT INTO order_items (order_id, book_id, quantity, price, total_price) VALUES ?',
      [orderItems]
    );

    // Clear the user's cart
    await pool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_role = req.user.role;

    let query = '';
    let params = [];

    // Admins can view all orders
    if (user_role === 'admin') {
      query = `
        SELECT o.order_id, o.total_price, o.created_at, 
               a.street_address, a.province, a.postal_code, a.country, 
               u.phone AS user_phone
        FROM orders o
        JOIN address a ON o.address_id = a.address_id
        JOIN users u ON o.user_id = u.user_id
        ORDER BY o.created_at DESC
      `;
    } else {
      // Regular users can only view their own orders
      query = `
        SELECT o.order_id, o.total_price, o.created_at, 
               a.street_address, a.province, a.postal_code, a.country, 
               u.phone AS user_phone
        FROM orders o
        JOIN address a ON o.address_id = a.address_id
        JOIN users u ON o.user_id = u.user_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `;
      params = [user_id];
    }

    const [orders] = await pool.query(query, params);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found.' });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params; // Order ID
    const user_id = req.user.id;
    const user_role = req.user.role;

    let query = '';
    let params = [];

    // Admins can view any order
    if (user_role === 'admin') {
      query = `
        SELECT o.order_id, o.total_price, o.created_at, 
               a.street_address, a.province, a.postal_code, a.country, 
               u.phone AS user_phone
        FROM orders o
        JOIN address a ON o.address_id = a.address_id
        JOIN users u ON o.user_id = u.user_id
        WHERE o.order_id = ?
      `;
      params = [id];
    } else {
      // Regular users can only view their own orders
      query = `
        SELECT o.order_id, o.total_price, o.created_at, 
               a.street_address, a.province, a.postal_code, a.country, 
               u.phone AS user_phone
        FROM orders o
        JOIN address a ON o.address_id = a.address_id
        JOIN users u ON o.user_id = u.user_id
        WHERE o.order_id = ? AND o.user_id = ?
      `;
      params = [id, user_id];
    }

    const [order] = await pool.query(query, params);

    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json(order[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    // Role-based authorization
    if (!['admin', 'seller'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Only admins or sellers can update order status.' });
    }

    // Validate status
    const validStatuses = ['shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${validStatuses.join(', ')}` });
    }

    // Check if the order exists
    const [order] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [req.params.id]);
    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Update the order status
    await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrderById = async (req, res) => {
  const { id } = req.params; // Order ID

  try {
    // Use req.user.id to ensure the order belongs to the authenticated user
    const user_id = req.user.id;
    const user_role = req.user.role;

    // Check if the order exists and belongs to the user (or allow admin access)
    const [order] = await pool.query(
      'SELECT * FROM orders WHERE order_id = ? AND (user_id = ? OR ? = "admin")',
      [id, user_id, user_role]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }

    // Delete the order items first (to maintain referential integrity)
    await pool.query('DELETE FROM order_items WHERE order_id = ?', [id]);

    // Delete the order
    await pool.query('DELETE FROM orders WHERE order_id = ?', [id]);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
