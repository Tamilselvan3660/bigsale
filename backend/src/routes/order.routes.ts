import { Router } from 'express';
import {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/my-orders', getMyOrders);
router.get('/admin/all', authorize('ADMIN', 'MANAGER'), getAllOrders);
router.put('/admin/:id/status', authorize('ADMIN', 'MANAGER'), updateOrderStatus);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);

export default router;
