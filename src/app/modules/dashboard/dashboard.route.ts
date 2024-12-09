import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

router.get(
  '/get-all-brand-statistics',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.getAllBrandStatistics
);

router.get(
  '/get-all-influencer-statistics',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.getAllInfluencerStatistics
);

router.get(
  '/get-monthly-earnings',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.getMonthlyEarnings
);
router.get(
  '/get-monthly-user-registration',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.getMonthlyUserRegistration
);

export const DashboardRoutes = router;
