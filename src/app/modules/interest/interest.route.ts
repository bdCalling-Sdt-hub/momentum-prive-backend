import express from 'express';

import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { InterestController } from './interest.controller';

const router = express.Router();

router.get(
  '/get-all/:userId',
  auth(USER_ROLES.BRAND),
  InterestController.getAllInterest
);

router.get('/:id', auth(USER_ROLES.BRAND), InterestController.getSingle);

router.patch('/:id', auth(USER_ROLES.BRAND), InterestController.updatedStatus);

export const InterestInFluencerRoutes = router;
