import express from 'express';
import { FaqController } from './Faq.controller';
import validateRequest from '../../middlewares/validateRequest';
import { FaqValidation } from './Faq.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-faq',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(FaqValidation.createFaqSchema),
  FaqController.createFaqToDB
);

router.get('/', FaqController.getAllFaq);

router.get('/:id', FaqController.getSingleFaq);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(FaqValidation.updatedFaqSchema),
  FaqController.updatedFaq
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  FaqController.deletedFaq
);

export const FaqRoutes = router;
