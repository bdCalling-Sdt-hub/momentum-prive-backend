import express from 'express';

import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { InterestController } from './interest.controller';

const router = express.Router();

router.get('/', InterestController.getAllInterest);

router.patch('/:id', InterestController.updatedStatus);

export const InterestInFluencerRoutes = router;
