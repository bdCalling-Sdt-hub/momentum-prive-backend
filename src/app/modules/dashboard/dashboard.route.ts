import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

router.get(
  '/get-all-brand-statistics',
  DashboardController.getAllBrandStatistics
);

router.get(
  '/get-all-influencer-statistics',
  DashboardController.getAllInfluencerStatistics
);

router.get('/get-monthly-earnings', DashboardController.getMonthlyEarnings);
router.get(
  '/get-monthly-user-registration',
  DashboardController.getMonthlyUserRegistration
);

export const DashboardRoutes = router;
