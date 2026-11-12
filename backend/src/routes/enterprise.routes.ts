import { Router } from 'express';
import { getEnterpriseAnalytics } from '../controllers/enterprise.controller';

const router = Router();

router.get('/enterprise/analytics', getEnterpriseAnalytics);

export default router;

