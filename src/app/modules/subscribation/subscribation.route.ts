import express from 'express';
import { SubscriptionController } from '../subscribtion/subscribtion.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SubscribationValidationZodSchema } from './subscribation.validation';
import { SubscribationController } from './subscribation.controller';

const router = express.Router();

router.post(
  '/create-subscription',

  SubscriptionController.createSubscription
);

// router.post('/payment', SubscribationController.createPaymentStripe);

// router.post(
//   '/create-subscription',
//   validateRequest(
//     SubscribationValidationZodSchema.createSubscribationZodSchema
//   ),
//   SubscribationController.createSubscriptationToDB
// );
// router.get('/', SubscribationController.getAllSubscriptation);

export const SubscriptationRoutes = router;
