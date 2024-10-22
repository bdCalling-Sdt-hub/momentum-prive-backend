import express, { NextFunction, Request, Response } from 'express';
import { InfluencerController } from './influencer.controller';
import validateRequest from '../../middlewares/validateRequest';
import { InfluencerValiationZodSchema } from './influencer.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.patch(
  '/:id',
  // validateRequest(InfluencerValiationZodSchema.InfluencerValiation),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = InfluencerValiationZodSchema.InfluencerValiation.parse(
      JSON.parse(req.body.data)
    );
    return InfluencerController.updatedInfluencer(req, res, next);
  }
);

router.get('/', InfluencerController.getAllInfluencer);

export const InfluencerRoutes = router;
