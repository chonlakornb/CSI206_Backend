import { pool } from '../config/db.js';

export const getCartItems = async (req, res) => {
  try {
    // Fetch cart items with total price for each item
    const [cartItems] = await pool.query(
      `SELECT c.cart_id, c.user_id, c.book_id, b.title, b.author, b.price, c.quantity, c.total_price 
       FROM cart c 
       JOIN books b ON c.book_id = b.book_id 
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    // Calculate the overall total price for the cart
    const overallTotalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

    res.json({ cartItems, overallTotalPrice: overallTotalPrice.toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  const { book_id, quantity } = req.body;

  try {
    // Check if the book exists
    const [books] = await pool.query('SELECT * FROM books WHERE book_id = ?', [book_id]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const bookPrice = parseFloat(books[0].price);

    // Check if the book is already in the user's cart
    const [existingCartItem] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND book_id = ?',
      [req.user.id, book_id]
    );

    if (existingCartItem.length > 0) {
      // Update the quantity and recalculate the total price
      const newQuantity = existingCartItem[0].quantity + quantity;
      const newTotalPrice = bookPrice * newQuantity;

      await pool.query(
        'UPDATE cart SET quantity = ?, total_price = ? WHERE user_id = ? AND book_id = ?',
        [newQuantity, newTotalPrice, req.user.id, book_id]
      );
      return res.json({ message: 'Book quantity updated in cart' });
    }

    // Add the book to the cart with the total price
    const totalPrice = bookPrice * quantity;
    await pool.query(
      'INSERT INTO cart (user_id, book_id, quantity, total_price) VALUES (?, ?, ?, ?)',
      [req.user.id, book_id, quantity, totalPrice]
    );

    res.status(201).json({ message: 'Book added to cart successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  const { id } = req.params; // 'id' is the cart_id
  const { quantity } = req.body;

  try {
    // Check if the cart item exists
    const [cartItems] = await pool.query('SELECT * FROM cart WHERE cart_id = ?', [id]);
    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const cartItem = cartItems[0];

    // Check if the book exists
    const [books] = await pool.query('SELECT * FROM books WHERE book_id = ?', [cartItem.book_id]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const bookPrice = parseFloat(books[0].price);

    // Calculate the new total price
    const newTotalPrice = bookPrice * quantity;

    // Update the cart item
    await pool.query(
      'UPDATE cart SET quantity = ?, total_price = ? WHERE cart_id = ?',
      [quantity, newTotalPrice, id]
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCartItem = async (req, res) => {
  const { id } = req.params; // 'id' is the cart_id

  try {
    // Check if the cart item exists
    const [cartItems] = await pool.query('SELECT * FROM cart WHERE cart_id = ?', [id]);
    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Delete the cart item
    await pool.query('DELETE FROM cart WHERE cart_id = ?', [id]);

    res.json({ message: 'Cart item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
