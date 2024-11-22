import express from 'express';
import { InviteController } from './invite.controller';
import validateRequest from '../../middlewares/validateRequest';
import { InviteValiationZodSchema } from './invite.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-invite',
  auth(USER_ROLES.BRAND),
  validateRequest(InviteValiationZodSchema.createInviteValiation),
  InviteController.createCategoryToDB
);

router.post(
  '/send-invite-influencer',
  auth(USER_ROLES.BRAND),
  validateRequest(InviteValiationZodSchema.createInviteValiation),
  InviteController.inviteForSpasificInfluencer
);
// router.post(
//   '/send-invite-influencer',
//   // auth(USER_ROLES.BRAND),
//   validateRequest(InviteValiationZodSchema.createInviteValiation),
//   InviteController.createInviteForInfluencerToDB
// );

router.get(
  '/',
  auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  InviteController.getAllInvites
);

router.get(
  '/get-invites-influencer/:influencerId',
  auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  InviteController.getAllInvitesForInfluencer
);
router.get(
  '/get-invites-brnad/:campaignId',
  auth(USER_ROLES.BRAND),
  InviteController.getAllInvitesForBrand
);

router.get(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER),
  InviteController.getSingleInvite
);

router.patch(
  '/:id',
  auth(USER_ROLES.BRAND),
  InviteController.updatedInviteToDB
);

export const InviteRoutes = router;
