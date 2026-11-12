import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../controllers/cart.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/items', addToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/clear', clearCart);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);
router.post('/apply-coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.delete('/remove-coupon', removeCoupon);

export default router;
