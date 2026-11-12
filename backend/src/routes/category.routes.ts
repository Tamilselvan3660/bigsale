import { Router } from 'express';
import {
  listCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listCategories);
router.get('/:identifier', getCategoryByIdOrSlug);

router.post('/', protect, authorize('ADMIN'), createCategory);
router.put('/:id', protect, authorize('ADMIN'), updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), deleteCategory);

export default router;
