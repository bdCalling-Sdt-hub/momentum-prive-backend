import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CollaborationController } from './collaboration.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { CollaborationValidation } from './collaboration.validation';

const router = express.Router();

router.post(
  '/create-collaboration',
  fileUploadHandler(),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = CollaborationValidation.createCollaboration.parse(
      JSON.parse(req.body.data)
    );
    return CollaborationController.createCollaborationToDB(req, res, next);
  }
);

router.get('/', CollaborationController.getAllCollaborations);

router.patch('/:id', CollaborationController.updatedCollaborationToDB);

export const CollaborationRoutes = router;
