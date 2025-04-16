import jwt from 'jsonwebtoken';


export const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminMiddleware = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'seller') { // Allow 'seller' role
    return res.status(403).json({ message: 'Access denied, admin or seller only' });
  }
  next();
};
