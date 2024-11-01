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
router.get('/', TermsAndConditionController.getAllTerms);

export const TermsAndConditionRoutes = router;
