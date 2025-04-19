import express from 'express';
import { addAddress, updateAddressById, getAllAddresses } from '../controllers/addressController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/address:
 *   post:
 *     summary: Add a new shipping address
 *     description: Add a new shipping address for the authenticated user.
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address_line:
 *                 type: string
 *                 description: The address line.
 *               city:
 *                 type: string
 *                 description: The city.
 *               state:
 *                 type: string
 *                 description: The state.
 *               postal_code:
 *                 type: string
 *                 description: The postal code.
 *               country:
 *                 type: string
 *                 description: The country.
 *     responses:
 *       201:
 *         description: Address added successfully.
 *       500:
 *         description: Internal server error.
 */
router.post('/address', authMiddleware, addAddress);

/**
 * @swagger
 * /api/address/{id}:
 *   put:
 *     summary: Update a user's shipping address
 *     description: Update the shipping address of the authenticated user by address ID.
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the address to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street_address:
 *                 type: string
 *                 description: The updated street address.
 *               city:
 *                 type: string
 *                 description: The updated city.
 *               postal_code:
 *                 type: string
 *                 description: The updated postal code.
 *               country:
 *                 type: string
 *                 description: The updated country.
 *     responses:
 *       200:
 *         description: Address updated successfully.
 *       404:
 *         description: Address not found or does not belong to the user.
 *       500:
 *         description: Internal server error.
 */
router.put('/address/:id', authMiddleware, updateAddressById);

/**
 * @swagger
 * /api/address:
 *   get:
 *     summary: Get all addresses
 *     description: Retrieve all addresses in the system. Admin access only.
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all addresses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   address_id:
 *                     type: integer
 *                     description: The ID of the address.
 *                   user_id:
 *                     type: integer
 *                     description: The ID of the user.
 *                   user_name:
 *                     type: string
 *                     description: The name of the user.
 *                   street_address:
 *                     type: string
 *                     description: The street address.
 *                   city:
 *                     type: string
 *                     description: The city.
 *                   postal_code:
 *                     type: string
 *                     description: The postal code.
 *                   country:
 *                     type: string
 *                     description: The country.
 *       403:
 *         description: Access denied. Admins only.
 *       500:
 *         description: Internal server error.
 */
router.get('/address', authMiddleware, getAllAddresses);

export default router;
