import express, { NextFunction, Request, Response } from 'express';

import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { ContactValiationZodSchema } from './contact.validation';
import { ContactController } from './contact.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-contact',
  fileUploadHandler(),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = ContactValiationZodSchema.ContactValiation.parse(
      JSON.parse(req.body.data)
    );
    return ContactController.createContactToDB(req, res, next);
  }
);

router.get('/', ContactController.getAllContacts);

export const ContactsRoutes = router;
