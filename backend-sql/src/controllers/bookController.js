import mysql from 'mysql2/promise';

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost', // Update with your MySQL host
  user: 'root',      // Update with your MySQL username
  password: 'root',  // Update with your MySQL password
  database: 'book_store', // Update with your MySQL database name
  charset: 'utf8mb4', // Ensure this is set
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const getAllBooks = async (req, res) => {
  try {
    // Use 'book_id' and include additional fields
    const [books] = await pool.query(
      'SELECT book_id, title, isbn, author, publisher, price, stock, category_id, user_id, created_at FROM books'
    );
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    // Use 'book_id' instead of 'id'
    const [books] = await pool.query(
      'SELECT book_id, title, isbn, author, publisher, price, stock, category_id, user_id, created_at FROM books WHERE book_id = ?',
      [req.params.id]
    );
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(books[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addBook = async (req, res) => {
  const { title, isbn, author, publisher, price, stock, category_id, user_id } = req.body;

  try {
    // Role-based authorization
    if (!['seller', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to add books.' });
    }

    // Validate category_id
    if (category_id) {
      const [categories] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [category_id]);
      if (categories.length === 0) {
        return res.status(400).json({ message: 'Invalid category_id. Category does not exist.' });
      }
    }

    // Validate user_id as a seller
    if (user_id) {
      const [sellers] = await pool.query('SELECT * FROM users WHERE user_id = ? AND role = ?', [user_id, 'seller']);
      if (sellers.length === 0) {
        return res.status(400).json({ message: 'Invalid user_id. Seller does not exist.' });
      }
    }

    // Insert all fields into the 'books' table
    await pool.query(
      'INSERT INTO books (title, isbn, author, publisher, price, stock, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, isbn, author, publisher, price, stock || 0, category_id || null, user_id || null]
    );
    res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookById = async (req, res) => {
  const { title, isbn, author, publisher, price, stock, category_id, user_id } = req.body;

  try {
    // Role-based authorization
    if (!['seller', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to update books.' });
    }

    const [books] = await pool.query('SELECT * FROM books WHERE book_id = ?', [req.params.id]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Validate category_id
    if (category_id) {
      const [categories] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [category_id]);
      if (categories.length === 0) {
        return res.status(400).json({ message: 'Invalid category_id. Category does not exist.' });
      }
    }

    // Validate user_id as a seller
    if (user_id) {
      const [sellers] = await pool.query('SELECT * FROM users WHERE user_id = ? AND role = ?', [user_id, 'seller']);
      if (sellers.length === 0) {
        return res.status(400).json({ message: 'Invalid user_id. Seller does not exist.' });
      }
    }

    // Update all fields in the 'books' table
    await pool.query(
      'UPDATE books SET title = ?, isbn = ?, author = ?, publisher = ?, price = ?, stock = ?, category_id = ?, user_id = ? WHERE book_id = ?',
      [
        title || books[0].title,
        isbn || books[0].isbn,
        author || books[0].author,
        publisher || books[0].publisher,
        price || books[0].price,
        stock || books[0].stock,
        category_id || books[0].category_id,
        user_id || books[0].user_id,
        req.params.id,
      ]
    );
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBookById = async (req, res) => {
  try {
    // Role-based authorization
    if (!['seller', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete books.' });
    }

    const [books] = await pool.query('SELECT * FROM books WHERE book_id = ?', [req.params.id]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await pool.query('DELETE FROM books WHERE book_id = ?', [req.params.id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchBooks = async (req, res) => {
  const { query } = req.query;

  try {
    const [books] = await pool.query(
      'SELECT book_id, title, isbn, author, publisher, price, stock, category_id, user_id, created_at FROM books WHERE title LIKE ? OR author LIKE ?',
      [`%${query}%`, `%${query}%`]
    );
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const filterBooks = async (req, res) => {
  const { category_id, user_id } = req.query;

  try {
    const conditions = [];
    const values = [];

    if (category_id) {
      conditions.push('category_id = ?');
      values.push(category_id);
    }

    if (user_id) {
      conditions.push('user_id = ?');
      values.push(user_id);
    }

    const query = `SELECT book_id, title, isbn, author, publisher, price, stock, category_id, user_id, created_at FROM books ${
      conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
    }`;
    const [books] = await pool.query(query, values);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
