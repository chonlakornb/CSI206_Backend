import express from 'express';
import { getNotifications, addNotification, deleteNotificationById } from '../controllers/notificationController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get('/notifications', authMiddleware, getNotifications);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Add a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               message:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification added successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/notifications', authMiddleware, adminMiddleware, addNotification);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete('/notifications/:id', authMiddleware, adminMiddleware, deleteNotificationById);

export default router;
