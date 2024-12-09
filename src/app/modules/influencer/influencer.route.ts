import express, { NextFunction, Request, Response } from 'express';
import { InfluencerController } from './influencer.controller';
import validateRequest from '../../middlewares/validateRequest';
import { InfluencerValiationZodSchema } from './influencer.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.patch(
  '/update-influencer',
  auth(USER_ROLES.INFLUENCER),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    const { imagesToDelete, data } = req.body;

    if (!data && imagesToDelete) {
      req.body = { imagesToDelete };
      return InfluencerController.updatedInfluencer(req, res, next);
    }

    if (data) {
      const parsedData = InfluencerValiationZodSchema.InfluencerValiation.parse(
        JSON.parse(data)
      );

      req.body = { ...parsedData, imagesToDelete };
    }

    return InfluencerController.updatedInfluencer(req, res, next);
  }
);

router.get(
  '/',
  auth(USER_ROLES.INFLUENCER),
  InfluencerController.getAllInfluencer
);

export const InfluencerRoutes = router;
