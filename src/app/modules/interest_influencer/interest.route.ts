import express from 'express';
import { InterestController } from './interest.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get(
  '/get-all/:userId',
  auth(USER_ROLES.BRAND),
  InterestController.getAllInterest
);

router.get(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  InterestController.getSingleInterest
);

router.patch(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  InterestController.updatedStatus
);

export const InterestRoutes = router;
