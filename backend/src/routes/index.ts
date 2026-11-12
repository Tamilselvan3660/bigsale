import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import checkoutRoutes from './checkout.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import searchRoutes from './search.routes';
import trustRoutes from './trust.routes';
import personalizationRoutes from './personalization.routes';
import retentionRoutes from './retention.routes';
import enterpriseRoutes from './enterprise.routes';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'BIGSALE API',
  });
});

// Resource routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/search', searchRoutes);
router.use('/', trustRoutes);
router.use('/', personalizationRoutes);
router.use('/', retentionRoutes);
router.use('/', enterpriseRoutes);

export default router;
