import express from 'express';
import { getShippingStatus } from '../controllers/shippingController.js';

const router = express.Router();

/**
 * @swagger
 * /api/shipping/{order_id}:
 *   get:
 *     summary: เช็กสถานะการจัดส่ง
 *     description: ดึงสถานะการจัดส่งของคำสั่งซื้อโดยใช้ order_id
 *     tags: [Shipping]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         schema:
 *           type: string
 *         required: true
 *         description: รหัสคำสั่งซื้อ
 *     responses:
 *       200:
 *         description: ข้อมูลสถานะการจัดส่ง
 *       404:
 *         description: ไม่พบคำสั่งซื้อ
 */
router.get('/:order_id', getShippingStatus);

export default router;
