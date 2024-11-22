import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';

import fileUploadHandler from '../../middlewares/fileUploadHandler';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SubmitProveValidation } from './submitProve.validation';
import { SubmitProveController } from './submitProve.controller';

const router = express.Router();

router.post(
  '/create-submit-prove',
  fileUploadHandler(),
  auth(USER_ROLES.INFLUENCER, USER_ROLES.BRAND),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SubmitProveValidation.createSubmitProve.parse(
      JSON.parse(req.body.data)
    );
    return SubmitProveController.submitProveToDB(req, res, next);
  }
);

router.get(
  '/get/:id',
  auth(USER_ROLES.INFLUENCER, USER_ROLES.BRAND),
  SubmitProveController.getAllSubmitProve
);

router.get(
  '/get-brand/:id',
  auth(USER_ROLES.BRAND),
  SubmitProveController.getAllSubmitProveForBrand
);

export const SubmitProveRoutes = router;
