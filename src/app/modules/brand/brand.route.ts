import express, { NextFunction, Request, Response } from 'express';
import { BrandController } from './brand.controller';
import { BrandValiationZodSchema } from './brand.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.patch(
  '/:id',
  fileUploadHandler(),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = BrandValiationZodSchema.BrandValiation.parse(
      JSON.parse(req.body.data)
    );
    return BrandController.updatedBrand(req, res, next);
  }
);

router.get('/', BrandController.getAllBrands);

export const BrandRoutes = router;
