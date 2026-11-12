import { Router } from 'express';
import {
  getDashboardStats,
  listCustomers,
  getCustomerById,
  updateCustomerStatus,
  listAuditLogs,
} from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/stats', authorize('ADMIN', 'MANAGER'), getDashboardStats);
router.get('/customers', authorize('ADMIN'), listCustomers);
router.get('/customers/:id', authorize('ADMIN'), getCustomerById);
router.put('/customers/:id/status', authorize('ADMIN'), updateCustomerStatus);
router.get('/audit-logs', authorize('ADMIN'), listAuditLogs);

export default router;
