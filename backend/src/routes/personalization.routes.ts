import { Router } from 'express';
import { getRecommendations, getBundles } from '../controllers/personalization.controller';

const router = Router();

router.get('/recommendations', getRecommendations);
router.get('/bundles', getBundles);

export default router;

