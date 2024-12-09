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
  auth(USER_ROLES.BRAND),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = CampaignValidationZodSchema.campaignValidation.parse(
      JSON.parse(req.body.data)
    );
    return CampaignController.createCampaignToDB(req, res, next);
  }
);

router.get(
  '/brand/:brandId',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  CampaignController.getCampaignforBrand
);
router.get(
  '/get-all/:brandId',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  CampaignController.getCampaignforAllData
);

router.get(
  '/',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN, USER_ROLES.INFLUENCER),
  CampaignController.getAllCampaigns
);

router.get(
  '/influencer',
  auth(USER_ROLES.INFLUENCER),
  CampaignController.getAllCampaignForInfluencer
);

router.get(
  '/admin',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CampaignController.getAllCampaignsForAdmin
);

router.get(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.INFLUENCER, USER_ROLES.ADMIN),
  CampaignController.getSingleCmpaign
);

router.patch(
  '/:id',
  auth(USER_ROLES.BRAND),
  fileUploadHandler(),
  //
  (req: Request, res: Response, next: NextFunction) => {
    req.body.data
      ? (req.body = CampaignValidationZodSchema.campaignUpdatedValidation.parse(
          JSON.parse(req.body.data)
        ))
      : {};
    return CampaignController.updateCampaignToDB(req, res, next);
  }
);

router.delete(
  '/:id',
  auth(USER_ROLES.BRAND, USER_ROLES.ADMIN),
  CampaignController.deletedCampaignToDB
);

export const CampaignRoutes = router;
