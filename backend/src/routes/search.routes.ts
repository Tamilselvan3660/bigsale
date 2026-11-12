import { Router } from 'express';
import {
  fullTextSearch,
  searchSuggestions,
} from '../controllers/search.controller';

const router = Router();

router.get('/', fullTextSearch);
router.get('/suggestions', searchSuggestions);

export default router;
