import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CampaignValidationZodSchema } from './campaign.validation';
import { CampaignController } from './campaign.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/create-campaign',
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = CampaignValidationZodSchema.campaignValidation.parse(
      JSON.parse(req.body.data)
    );
    return CampaignController.createCampaignToDB(req, res, next);
  }
);

router.get(
  '/',
  // auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  CampaignController.getAllCampaigns
);

router.get(
  '/:id',
  // auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  CampaignController.getSingleCmpaign
);

router.patch(
  '/:id',
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = CampaignValidationZodSchema.campaignUpdatedValidation.parse(
      JSON.parse(req.body.data)
    );
    return CampaignController.updateCampaignToDB(req, res, next);
  }
);

router.put(
  '/:userId',
  // auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  CampaignController.updatedCampaignStatusToDB
);

router.delete(
  '/:id',
  // auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  CampaignController.deletedCampaignToDB
);

export const CampaignRoutes = router;
