import express from 'express';
import { getRecommendations, addRecommendation, deleteRecommendationById } from '../controllers/recommendationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get user's recommendations
 *     description: Retrieve a list of book recommendations for the currently authenticated user.
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommendations.
 *       401:
 *         description: Unauthorized.
 */
router.get('/recommendations', authMiddleware, getRecommendations);

/**
 * @swagger
 * /api/recommendations:
 *   post:
 *     summary: Add a recommendation
 *     description: Add a new book recommendation for the currently authenticated user.
 *     tags: [Recommendations]
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
 *                 description: The ID of the recommended book.
 *               reason:
 *                 type: string
 *                 description: The reason for the recommendation.
 *     responses:
 *       201:
 *         description: Recommendation added successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post('/recommendations', authMiddleware, addRecommendation);

/**
 * @swagger
 * /api/recommendations/{id}:
 *   delete:
 *     summary: Delete a recommendation by ID
 *     description: Delete a book recommendation by its ID.
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the recommendation.
 *     responses:
 *       200:
 *         description: Recommendation deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Recommendation not found.
 */
router.delete('/recommendations/:id', authMiddleware, deleteRecommendationById);

export default router;
