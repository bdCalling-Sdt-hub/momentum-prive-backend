import express from 'express';
import { InterestController } from './interest.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/get', auth(USER_ROLES.BRAND), InterestController.getAllInterest);

router.patch('/:id', auth(USER_ROLES.BRAND), InterestController.updatedStatus);

export const InterestRoutes = router;
