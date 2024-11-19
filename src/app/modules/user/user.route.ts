import express, { NextFunction, Request, Response } from 'express';
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

router.patch(
  '/:id',
  fileUploadHandler(),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body.data
      ? (req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        ))
      : {};
    return UserController.updateProfileToDB(req, res, next);
  }
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

router.get(
  '/brand',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BRAND),
  UserController.getAllBrands
);
router.get(
  '/influencer',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BRAND),
  UserController.getAllInfluencer
);
router.get(
  '/influencer-brand',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BRAND),
  UserController.getAllInfluencerForBrand
);

router.get(
  '/influencer/:id',
  auth(
    USER_ROLES.INFLUENCER,
    USER_ROLES.BRAND,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN
  ),
  UserController.getSingleInflueencer
);

export const UserRoutes = router;
