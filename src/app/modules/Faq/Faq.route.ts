import express from 'express';
import { FaqController } from './Faq.controller';
import validateRequest from '../../middlewares/validateRequest';
import { FaqValidation } from './Faq.validation';

const router = express.Router();

router.post(
  '/create-faq',
  validateRequest(FaqValidation.createFaqSchema),
  FaqController.createFaqToDB
);

router.get('/', FaqController.getAllFaq);

router.get('/:id', FaqController.getSingleFaq);

router.patch(
  '/:id',
  validateRequest(FaqValidation.updatedFaqSchema),
  FaqController.updatedFaq
);

router.delete('/:id', FaqController.deletedFaq);

export const FaqRoutes = router;
