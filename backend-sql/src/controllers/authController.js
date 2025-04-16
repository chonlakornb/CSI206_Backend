import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost', // Update with your MySQL host
  user: 'root',      // Update with your MySQL username
  password: 'root', // Update with your MySQL password
  database: 'book_store', // Update with your MySQL database name
});


export const registerUser = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    // Validate role
    const validRoles = ['customer', 'seller', 'admin']; // Allow only 'customer', 'seller', and 'admin'
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Allowed roles are: ${validRoles.join(', ')}` });
    }

    // Check if the email already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, role || 'customer']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Use 'user_id' instead of 'id' in the JWT payload
    const token = jwt.sign({ id: user.user_id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = (req, res) => {
  // Invalidate the token (implementation depends on your token management strategy)
  res.status(200).json({ message: 'User logged out successfully' });
};

export const refreshToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const newToken = jwt.sign({ id: decoded.id, role: decoded.role }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
