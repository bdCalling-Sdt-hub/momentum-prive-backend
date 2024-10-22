import express from 'express';
import { InviteController } from './invite.controller';
import validateRequest from '../../middlewares/validateRequest';
import { InviteValiationZodSchema } from './invite.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-invite',
  validateRequest(InviteValiationZodSchema.createInviteValiation),
  InviteController.createCategoryToDB
);

router.get('/', InviteController.getAllInvites);

router.patch(
  '/:id',
  // auth(USER_ROLES.INFLUENCER),
  InviteController.updatedInviteToDB
);

export const InviteRoutes = router;
