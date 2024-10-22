import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { DiscountClubController } from './discountClub.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { DiscountClubValidation } from './discountClub.validation';

const router = express.Router();

router.post(
  '/create-discount',
  // auth(USER_ROLES.BRAND),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = DiscountClubValidation.createDiscountClubValidation.parse(
      JSON.parse(req.body.data)
    );
    return DiscountClubController.createDiscountClubToDB(req, res, next);
  }
);

router.post('/:id/payment', DiscountClubController.createPaymentIntent);

router.get(
  '/',
  // auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  DiscountClubController.getAllDiscount
);

router.get(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  DiscountClubController.getSingleDiscount
);

router.patch(
  '/:id',
  // auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = DiscountClubValidation.updatedDiscountClubValidation.parse(
      JSON.parse(req.body.data)
    );
    return DiscountClubController.updateCampaignToDB(req, res, next);
  }
);

router.delete(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  DiscountClubController.deletedCampaignToDB
);

export const DiscountClubRoutes = router;
