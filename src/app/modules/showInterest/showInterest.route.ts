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

export const ShowInterestRoutes = router;
