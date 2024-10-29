import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

import { PermissionAccessCampaignController } from './permission_access_campaign.controller';

const router = express.Router();

router.get('/get', PermissionAccessCampaignController.getAllCampaigns);

router.patch(
  '/:id',
  //   auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PermissionAccessCampaignController.updatedCampaignStatus
);

export const UpdatedCampaignStatusRoutes = router;