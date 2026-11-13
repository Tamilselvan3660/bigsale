import { Router } from 'express';
import { getRenewProducts, submitTradeInRequest } from '../controllers/renew.controller';
import { handleVisualSearch } from '../controllers/visualSearch.controller';
import { getSetupBuilderOptions, validateSetupCompatibility } from '../controllers/setupBuilder.controller';
import { calculateEnergyCost, getProductEnergyProfile } from '../controllers/energy.controller';
import { verifyProductAuthenticity } from '../controllers/trustCenter.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// 1. BIGSALE Renew & Trade-in Marketplace
router.get('/renew/products', getRenewProducts);
router.post('/renew/trade-in', optionalAuth, submitTradeInRequest);

// 2. BIGSALE Visual & Barcode Search
router.post('/search/visual', handleVisualSearch);

// 3. BIGSALE Setup Builder
router.get('/setup-builder/components', getSetupBuilderOptions);
router.post('/setup-builder/validate', validateSetupCompatibility);

// 4. BIGSALE Energy Intelligence
router.post('/energy/calculate', calculateEnergyCost);
router.get('/energy/product/:productId', getProductEnergyProfile);

// 5. BIGSALE Trust Centre & Verification
router.post('/trust-center/verify', verifyProductAuthenticity);

export default router;

