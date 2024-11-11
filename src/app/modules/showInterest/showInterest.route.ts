import express from 'express';

import validateRequest from '../../middlewares/validateRequest';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ShowInterestController } from './showInterest.controller';

const router = express.Router();

router.post(
  '/send-interest',
  // auth(USER_ROLES.BRAND),
  ShowInterestController.createInviteForInfluencerToDB
);

router.get(
  '/get/:influencerId',
  // auth(USER_ROLES.BRAND),
  ShowInterestController.getAllShowInterest
);

router.get(
  '/get-single/:id',
  // auth(USER_ROLES.BRAND),
  ShowInterestController.getOneShowInterest
);

router.get(
  '/get-all-brand/:userId',
  // auth(USER_ROLES.BRAND),
  ShowInterestController.getAllShowInterestForBrand
);
router.patch(
  '/:id',
  // auth(USER_ROLES.BRAND),
  ShowInterestController.updateInterestStatusToDB
);

export const ShowInterestRoutes = router;
