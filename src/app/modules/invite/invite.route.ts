import express from 'express';
import { InviteController } from './invite.controller';
import validateRequest from '../../middlewares/validateRequest';
import { InviteValiationZodSchema } from './invite.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-invite',
  // auth(USER_ROLES.BRAND),
  validateRequest(InviteValiationZodSchema.createInviteValiation),
  InviteController.createCategoryToDB
);
router.post(
  '/send-invite-influencer',
  // auth(USER_ROLES.BRAND),
  validateRequest(InviteValiationZodSchema.createInviteValiation),
  InviteController.createInviteForInfluencerToDB
);

router.get(
  '/',
  auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  InviteController.getAllInvites
);
router.get(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  InviteController.getSingleInvite
);

router.patch(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  InviteController.updatedInviteToDB
);

export const InviteRoutes = router;
