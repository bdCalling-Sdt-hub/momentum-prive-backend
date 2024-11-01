import express, { NextFunction, Request, Response } from 'express';
import { InfluencerController } from './influencer.controller';
import validateRequest from '../../middlewares/validateRequest';
import { InfluencerValiationZodSchema } from './influencer.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.patch(
  '/:id',
  // validateRequest(InfluencerValiationZodSchema.InfluencerValiation),
  // auth(USER_ROLES.INFLUENCER),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = InfluencerValiationZodSchema.InfluencerValiation.parse(
      JSON.parse(req.body.data)
    );
    return InfluencerController.updatedInfluencer(req, res, next);
  }
);

router.get(
  '/',
  auth(USER_ROLES.INFLUENCER),
  InfluencerController.getAllInfluencer
);

export const InfluencerRoutes = router;
