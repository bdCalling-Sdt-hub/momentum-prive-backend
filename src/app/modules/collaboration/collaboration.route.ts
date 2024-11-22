import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CollaborationController } from './collaboration.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { CollaborationValidation } from './collaboration.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-collaboration',
  fileUploadHandler(),
  auth(USER_ROLES.INFLUENCER),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = CollaborationValidation.createCollaboration.parse(
      JSON.parse(req.body.data)
    );
    return CollaborationController.createCollaborationToDB(req, res, next);
  }
);

router.get(
  '/',
  auth(USER_ROLES.INFLUENCER, USER_ROLES.BRAND),
  CollaborationController.getAllCollaborations
);

router.get(
  '/:id',
  auth(USER_ROLES.INFLUENCER, USER_ROLES.BRAND),
  CollaborationController.getAllCollaborationForInfluencer
);

router.patch('/:id', CollaborationController.updatedCollaborationToDB);

export const CollaborationRoutes = router;
