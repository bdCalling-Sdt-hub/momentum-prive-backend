import express from 'express';
import { TermsAndConditionController } from './termsAndCondition.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-terms',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TermsAndConditionController.createCategoryToDB
);
router.get(
  '/get-terms-brand',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.BRAND),
  TermsAndConditionController.getAllTerms
);

// influencers

router.post(
  '/create-terms-influences',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TermsAndConditionController.createTermAndConditionInfluencers
);

router.get(
  '/get-terms-influences',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.INFLUENCER),
  TermsAndConditionController.getTermAndConditionInfluencers
);

export const TermsAndConditionRoutes = router;
