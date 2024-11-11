import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { DiscountClubController } from './discountClub.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { DiscountClubValidation } from './discountClub.validation';

const router = express.Router();

router.post(
  '/create-discount',
  auth(USER_ROLES.BRAND),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = DiscountClubValidation.createDiscountClubValidation.parse(
      JSON.parse(req.body.data)
    );
    return DiscountClubController.createDiscountClubToDB(req, res, next);
  }
);

router.get(
  '/brand/:userId',
  auth(
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  ),

  DiscountClubController.getAllDiscount
);

router.get(
  '/get-all-discount',
  auth(
    USER_ROLES.BRAND,
    USER_ROLES.INFLUENCER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  ),

  DiscountClubController.getAllDiscount
);

router.get(
  '/:id',
  auth(
    USER_ROLES.BRAND,
    USER_ROLES.ADMIN,
    USER_ROLES.INFLUENCER,
    USER_ROLES.SUPER_ADMIN
  ),
  DiscountClubController.getSingleDiscount
);

router.patch(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),

  (req: Request, res: Response, next: NextFunction) => {
    req.body.data
      ? (req.body = DiscountClubValidation.updatedDiscountClubValidation.parse(
          JSON.parse(req.body.data)
        ))
      : {};
    return DiscountClubController.updateCampaignToDB(req, res, next);
  }
);

router.patch(
  '/statusUpdate/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DiscountClubController.DiscountClubUpdateSatus
);

export const DiscountClubRoutes = router;
