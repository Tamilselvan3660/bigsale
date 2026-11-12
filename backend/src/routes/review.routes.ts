import { Router } from 'express';
import {
  listProductReviews,
  createReview,
  deleteReview,
} from '../controllers/review.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', listProductReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

export default router;
