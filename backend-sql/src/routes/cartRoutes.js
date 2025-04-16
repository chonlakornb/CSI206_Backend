import express from 'express';
import { getCartItems, addToCart, updateCartItem, deleteCartItem } from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart items
 *     description: Retrieve a list of items in the currently authenticated user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cart items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   cart_id:
 *                     type: string
 *                     description: The ID of the cart entry.
 *                   user_id:
 *                     type: string
 *                     description: The ID of the user.
 *                   book_id:
 *                     type: string
 *                     description: The ID of the book.
 *                   title:
 *                     type: string
 *                     description: The title of the book.
 *                   author:
 *                     type: string
 *                     description: The author of the book.
 *                   price:
 *                     type: number
 *                     description: The price of the book.
 *                   quantity:
 *                     type: number
 *                     description: The quantity of the book in the cart.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get('/cart', authMiddleware, getCartItems);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add a book to the cart
 *     description: Add a book to the currently authenticated user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: string
 *                 description: The ID of the book to add to the cart.
 *               quantity:
 *                 type: number
 *                 description: The quantity of the book to add.
 *     responses:
 *       201:
 *         description: Book added to cart successfully.
 *       400:
 *         description: Invalid input or book already in cart.
 *       404:
 *         description: Book not found.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.post('/cart', authMiddleware, addToCart);

/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of a specific item in the cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the cart item to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: The new quantity for the cart item.
 *     responses:
 *       200:
 *         description: Cart item updated successfully.
 *       404:
 *         description: Cart item or book not found.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.put('/cart/:id', authMiddleware, updateCartItem);

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Delete a cart item
 *     description: Remove a specific item from the cart by its ID.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the cart item to delete.
 *     responses:
 *       200:
 *         description: Cart item deleted successfully.
 *       404:
 *         description: Cart item not found.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.delete('/cart/:id', authMiddleware, deleteCartItem);

export default router;
