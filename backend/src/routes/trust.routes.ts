import { Router } from 'express';
import { compareProducts } from '../controllers/compare.controller';
import { checkShippingAvailability } from '../controllers/shipping.controller';
import { checkCompatibility } from '../controllers/compatibility.controller';
import { getPriceHistory, createPriceAlert } from '../controllers/priceAlert.controller';
import { handleAssistantQuery } from '../controllers/ai.controller';

const router = Router();

// 1. Advanced Product Comparison
router.get('/compare', compareProducts);

// 2. Shipping & Delivery Serviceability
router.get('/shipping/check', checkShippingAvailability);

// 3. Hardware & Accessory Compatibility Engine
router.get('/compatibility/check', checkCompatibility);

// 4. Price Intelligence & Price Alerts
router.get('/price-history/:id', getPriceHistory);
router.post('/price-alerts', createPriceAlert);

// 5. BIGSALE AI Shopping Assistant
router.post('/ai/chat', handleAssistantQuery);

export default router;

