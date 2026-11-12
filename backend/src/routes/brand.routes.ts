import { Router } from 'express';
import {
  listBrands,
  getBrandByIdOrSlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brand.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listBrands);
router.get('/:identifier', getBrandByIdOrSlug);

router.post('/', protect, authorize('ADMIN'), createBrand);
router.put('/:id', protect, authorize('ADMIN'), updateBrand);
router.delete('/:id', protect, authorize('ADMIN'), deleteBrand);

export default router;
