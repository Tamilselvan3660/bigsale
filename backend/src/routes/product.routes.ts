import { Router } from 'express';
import {
  listProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:identifier', getProductByIdOrSlug);

router.post('/', protect, authorize('ADMIN', 'MANAGER'), createProduct);
router.put('/:id', protect, authorize('ADMIN', 'MANAGER'), updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);

export default router;
