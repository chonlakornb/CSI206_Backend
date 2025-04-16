import mysql from 'mysql2/promise';

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost', // Update with your MySQL host
  user: 'root',      // Update with your MySQL username
  password: 'root',  // Update with your MySQL password
  database: 'book_store', // Update with your MySQL database name
});

export const getReviewsByBookId = async (req, res) => {
  const { bookId } = req.params;

  try {
    const [reviews] = await pool.query(
      'SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.book_id = ?',
      [bookId]
    );
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addReview = async (req, res) => {
  const { bookId } = req.params;
  const { rating, comment } = req.body;

  try {
    await pool.query(
      'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.user.id, bookId, rating, comment]
    );
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReviewById = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  try {
    const [reviews] = await pool.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = reviews[0];
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }

    await pool.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating || review.rating, comment || review.comment, reviewId]
    );
    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReviewById = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const [reviews] = await pool.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = reviews[0];
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
