import { Router } from 'express';
import { calculateCheckout, placeOrder } from '../controllers/checkout.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/calculate', calculateCheckout);
router.post('/place-order', placeOrder);

export default router;
