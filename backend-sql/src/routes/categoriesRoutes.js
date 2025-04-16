import express from 'express';
import { getCategories, addCategory, updateCategoryById, deleteCategoryById } from '../controllers/categoryController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all categories.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The ID of the category.
 *                   name:
 *                     type: string
 *                     description: The name of the category.
 *       500:
 *         description: Internal server error.
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Add a new category
 *     description: Add a new category to the system. Only accessible by admin users.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new category.
 *     responses:
 *       201:
 *         description: Category added successfully.
 *       400:
 *         description: Category already exists.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access denied.
 *       500:
 *         description: Internal server error.
 */
router.post('/categories', authMiddleware, adminMiddleware, addCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     description: Update the name of a category by its ID. Only accessible by admin users.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the category.
 *     responses:
 *       200:
 *         description: Category updated successfully.
 *       400:
 *         description: Category name already exists.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/categories/:id', authMiddleware, adminMiddleware, updateCategoryById);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     description: Delete a category by its ID. Only accessible by admin users.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category to delete.
 *     responses:
 *       200:
 *         description: Category deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/categories/:id', authMiddleware, adminMiddleware, deleteCategoryById);

export default router;
