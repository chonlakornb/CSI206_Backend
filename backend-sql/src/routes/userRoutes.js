import express from 'express';
import { getUsers, getUserProfile, updateUserProfile, deleteUserProfile, updateUserById } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all registered users.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users.
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the profile of the currently authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile.
 *       401:
 *         description: Unauthorized.
 */
router.get('/users/me', authMiddleware, getUserProfile);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update user profile
 *     description: Update the profile of the currently authenticated user. Fields that can be updated include username, password, and role.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The new username for the user.
 *               password:
 *                 type: string
 *                 description: The new password for the user.
 *               role:
 *                 type: string
 *                 description: The new role for the user.
 *     responses:
 *       200:
 *         description: User profile updated successfully.
 *       401:
 *         description: Unauthorized.
 */
router.put('/users/me', authMiddleware, updateUserProfile);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Delete user profile
 *     description: Delete the profile of the currently authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully.
 *       401:
 *         description: Unauthorized.
 */
router.delete('/users/me', authMiddleware, deleteUserProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user account
 *     description: Update the account details of a user by their ID. Fields that can be updated include name, phone, and password.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the user.
 *               phone:
 *                 type: string
 *                 description: The new phone number for the user.
 *               password:
 *                 type: string
 *                 description: The new password for the user.
 *     responses:
 *       200:
 *         description: User account updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
router.put('/users/:id', authMiddleware, updateUserById);

export default router;
