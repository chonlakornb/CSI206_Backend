import express from 'express';
import { createShipping, getShippingStatus, updateShippingStatus } from '../controllers/shippingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/shipping:
 *   post:
 *     summary: Create a new shipping record
 *     description: Create a new shipping record for an order with the specified address.
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: integer
 *                 description: The ID of the order.
 *               address_id:
 *                 type: integer
 *                 description: The ID of the address.
 *     responses:
 *       201:
 *         description: Shipping record created successfully.
 *       404:
 *         description: Order or address not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/', authMiddleware, createShipping);

/**
 * @swagger
 * /api/shipping/{order_id}:
 *   get:
 *     summary: Get shipping status
 *     description: Retrieve the shipping status for a specific order.
 *     tags: [Shipping]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the order.
 *     responses:
 *       200:
 *         description: Shipping status retrieved successfully.
 *       404:
 *         description: Shipping information not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:order_id', authMiddleware, getShippingStatus);

/**
 * @swagger
 * /api/shipping/{id}/status:
 *   put:
 *     summary: Update shipping status
 *     description: Update the shipping status for a specific shipping record. Only accessible by admins or sellers.
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the shipping record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [preparing, shipped, delivered]
 *                 description: The new shipping status.
 *     responses:
 *       200:
 *         description: Shipping status updated successfully.
 *       400:
 *         description: Invalid status.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Shipping record not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:id/status', authMiddleware, updateShippingStatus);

export default router;
