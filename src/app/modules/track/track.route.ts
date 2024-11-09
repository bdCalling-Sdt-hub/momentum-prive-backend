import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { TrackController } from './track.controller';

const router = express.Router();

router.get(
  '/get-all-track',
  //   auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  TrackController.getAlllTrackToDB
);

router.patch(
  '/:id',
  //   auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  TrackController.updateTrackStatus
);

export const TrackRoutes = router;
