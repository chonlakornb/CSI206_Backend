import express from 'express';
import { getSellers, getSellerById, updateSellerById, deleteSellerById } from '../controllers/sellerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/sellers:
 *   get:
 *     summary: Get all sellers
 *     description: Retrieve a list of all registered sellers with their details.
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sellers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: string
 *                     description: The ID of the seller.
 *                   name:
 *                     type: string
 *                     description: The name of the seller.
 *                   email:
 *                     type: string
 *                     description: The email of the seller.
 *                   phone:
 *                     type: string
 *                     description: The phone number of the seller.
 *       401:
 *         description: Unauthorized.
 */
router.get('/sellers', authMiddleware, getSellers);

/**
 * @swagger
 * /api/sellers/{id}:
 *   get:
 *     summary: Get seller details by ID
 *     description: Retrieve the details of a specific seller by their ID.
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the seller.
 *     responses:
 *       200:
 *         description: Seller details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: The ID of the seller.
 *                 name:
 *                   type: string
 *                   description: The name of the seller.
 *                 email:
 *                   type: string
 *                   description: The email of the seller.
 *                 phone:
 *                   type: string
 *                   description: The phone number of the seller.
 *       404:
 *         description: Seller not found.
 *       401:
 *         description: Unauthorized.
 */
router.get('/sellers/:id', authMiddleware, getSellerById);

/**
 * @swagger
 * /api/sellers/{id}:
 *   put:
 *     summary: Update seller account
 *     description: Update the account details of a seller by their ID. Fields that can be updated include name, email, and phone.
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the seller to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the seller.
 *               email:
 *                 type: string
 *                 description: The new email for the seller.
 *               phone:
 *                 type: string
 *                 description: The new phone number for the seller.
 *     responses:
 *       200:
 *         description: Seller account updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Seller not found.
 */
router.put('/sellers/:id', authMiddleware, updateSellerById);

/**
 * @swagger
 * /api/sellers/{id}:
 *   delete:
 *     summary: Delete seller account
 *     description: Delete a seller account by their ID.
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the seller to delete.
 *     responses:
 *       200:
 *         description: Seller account deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Seller not found.
 */
router.delete('/sellers/:id', authMiddleware, deleteSellerById);

export default router;
