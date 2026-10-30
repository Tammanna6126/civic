import { Router } from 'express';
import {
  getHotspots,
  getDashboardStats,
  getActionBrief
} from '../controllers/analyticsController';

const router = Router();

router.get('/hotspots', getHotspots);
router.get('/stats', getDashboardStats);
router.get('/action-brief', getActionBrief);

export default router;
