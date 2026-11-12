import { Router } from 'express';
import {
  registerWarranty,
  createServiceRequest,
  getLoyaltyProfile,
  getShipmentTracking,
  createSupportTicket,
} from '../controllers/retention.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/warranty/register', optionalAuth, registerWarranty);
router.post('/service/requests', optionalAuth, createServiceRequest);
router.get('/loyalty/profile', optionalAuth, getLoyaltyProfile);
router.get('/shipments/track/:orderId', getShipmentTracking);
router.post('/support/tickets', optionalAuth, createSupportTicket);

export default router;
