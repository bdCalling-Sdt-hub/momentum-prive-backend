import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PermissionController } from './permission.controller';

const router = express.Router();

router.get(
  '/brand',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PermissionController.getAllBrandUser
);

router.get(
  '/influencer',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PermissionController.getAllInfluencerUser
);

router.patch(
  '/:id',
  //   auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PermissionController.updatedUserLoginStatus
);

export const PermissonRoutes = router;
