import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/create-brand')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createBrandToDB
  )
  .patch(
    auth(USER_ROLES.ADMIN),
    fileUploadHandler(),
    UserController.updateProfile
  );

router
  .route('/create-influencer')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createInfluencer
  )
  .patch(
    auth(USER_ROLES.ADMIN),
    fileUploadHandler(),
    UserController.updateProfile
  );

router.get(
  '/profile',
  auth(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER
  ),
  UserController.getUserProfile
);

export const UserRoutes = router;
