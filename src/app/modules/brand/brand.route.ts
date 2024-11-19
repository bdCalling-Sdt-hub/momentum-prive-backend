import express, { NextFunction, Request, Response } from 'express';
import { BrandController } from './brand.controller';
import { BrandValiationZodSchema } from './brand.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.patch(
  '/update-brand',
  fileUploadHandler(),
  auth(USER_ROLES.BRAND),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = BrandValiationZodSchema.BrandValiation.parse(
        JSON.parse(req.body.data)
      );
    }
    return BrandController.updatedBrand(req, res, next);
  }
);

router.get('/', BrandController.getAllBrands);

export const BrandRoutes = router;
