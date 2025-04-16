import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order from the user's cart.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully.
 *       400:
 *         description: Cart is empty.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.post('/', authMiddleware, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders for the authenticated user
 *     description: Retrieve all orders for the authenticated user.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get('/', authMiddleware, getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get details of a specific order
 *     description: Retrieve the details of a specific order by its ID for the authenticated user.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order
 *     responses:
 *       200:
 *         description: Order details retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', authMiddleware, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update the status of an order
 *     description: Update the status of an order to "shipped" or "delivered" (admin/seller only).
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [shipped, delivered]
 *                 description: The new status of the order
 *     responses:
 *       200:
 *         description: Order status updated successfully.
 *       400:
 *         description: Invalid status.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:id/status', authMiddleware, updateOrderStatus);

export default router;
