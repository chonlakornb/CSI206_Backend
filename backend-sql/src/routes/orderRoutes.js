import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrderById } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order from the user's cart and associate it with a selected address.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address_id:
 *                 type: integer
 *                 description: The ID of the address to associate with the order.
 *     responses:
 *       201:
 *         description: Order created successfully.
 *       400:
 *         description: Cart is empty or invalid address.
 *       404:
 *         description: Address not found or does not belong to the user.
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

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     description: Delete an order by its ID. Users can delete their own orders, and admins can delete any order.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the order to delete.
 *     responses:
 *       200:
 *         description: Order deleted successfully.
 *       404:
 *         description: Order not found or access denied.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', authMiddleware, deleteOrderById);

export default router;
