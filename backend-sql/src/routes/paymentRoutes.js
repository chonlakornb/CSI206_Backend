import express from 'express';
import { processPayment, getPaymentByOrderId, updatePaymentStatus } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a payment for an order
 *     description: Allows a customer to make a payment for an order.
 *     tags: [Payments]
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
 *                 description: The ID of the order to pay for
 *               payment_method:
 *                 type: string
 *                 description: The payment method (e.g., credit_card, paypal)
 *               amount:
 *                 type: number
 *                 description: The payment amount
 *     responses:
 *       201:
 *         description: Payment processed successfully.
 *       400:
 *         description: Payment amount does not match the order total.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/', authMiddleware, processPayment);

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     summary: Update payment details
 *     description: Allows a customer to update payment details for an order.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the payment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_method:
 *                 type: string
 *                 description: The updated payment method (e.g., credit_card, paypal)
 *     responses:
 *       200:
 *         description: Payment updated successfully.
 *       400:
 *         description: Invalid request.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Payment not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { payment_method } = req.body;

  try {
    // Role-based authorization
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Forbidden: Only customers can update payments.' });
    }

    // Check if the payment exists and belongs to the user
    const [payment] = await pool.query('SELECT * FROM payments WHERE payment_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (payment.length === 0) {
      return res.status(404).json({ message: 'Payment not found or does not belong to the user.' });
    }

    // Update the payment method
    await pool.query('UPDATE payments SET payment_method = ? WHERE payment_id = ?', [payment_method, req.params.id]);

    res.json({ message: 'Payment updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/payments/{order_id}:
 *   get:
 *     summary: Get payment details for a specific order
 *     description: Retrieve payment details for a specific order by its ID for the authenticated user.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to retrieve payment details for
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Payment not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:order_id', authMiddleware, getPaymentByOrderId);

/**
 * @swagger
 * /api/payments/{id}/status:
 *   put:
 *     summary: Update the status of a payment
 *     description: Allows an admin to update the status of a payment.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the payment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *                 description: The new status of the payment
 *     responses:
 *       200:
 *         description: Payment status updated successfully.
 *       400:
 *         description: Invalid status.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Payment not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:id/status', authMiddleware, updatePaymentStatus);

export default router;
