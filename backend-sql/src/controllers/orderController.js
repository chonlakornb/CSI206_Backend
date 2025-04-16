import { pool } from '../config/db.js';

export const createOrder = async (req, res) => {
  try {
    // Role-based authorization
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Forbidden: Only customers can create orders.' });
    }

    // Fetch cart items for the user
    const [cartItems] = await pool.query(
      `SELECT c.cart_id, c.book_id, c.quantity, 
              (c.quantity * b.price) AS total_price, b.price AS book_price 
       FROM cart c 
       JOIN books b ON c.book_id = b.book_id 
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Cannot create an order.' });
    }

    // Calculate the total order price
    const totalOrderPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

    // Ensure totalOrderPrice is not zero to avoid duplicate entry issues
    if (totalOrderPrice === 0) {
      return res.status(400).json({ message: 'Total order price cannot be zero.' });
    }

    // Create a new order (use the correct column name, e.g., total_price)
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, total_price, created_at) VALUES (?, ?, NOW())',
      [req.user.id, totalOrderPrice]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    const orderItems = cartItems.map(item => [
      orderId,
      item.book_id,
      item.quantity,
      item.book_price,
      item.total_price, // Use total_price instead of total_amount
    ]);

    await pool.query(
      'INSERT INTO order_items (order_id, book_id, quantity, price, total_price) VALUES ?',
      [orderItems]
    );

    // Clear the user's cart
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    // Role-based authorization
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Forbidden: Only customers can view their orders.' });
    }

    // Fetch orders for the authenticated user
    const [orders] = await pool.query(
      `SELECT o.order_id, o.total_price, o.created_at, 
              oi.book_id, oi.quantity, oi.price AS book_price, oi.total_price AS item_total_price 
       FROM orders o 
       JOIN order_items oi ON o.order_id = oi.order_id 
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

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
    // Role-based authorization
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Forbidden: Only customers can view their orders.' });
    }

    // Fetch the order details for the authenticated user
    const [order] = await pool.query(
      `SELECT o.order_id, o.total_price, o.created_at, 
              oi.book_id, oi.quantity, oi.price AS book_price, oi.total_price AS item_total_price 
       FROM orders o 
       JOIN order_items oi ON o.order_id = oi.order_id 
       WHERE o.order_id = ? AND o.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json(order);
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
