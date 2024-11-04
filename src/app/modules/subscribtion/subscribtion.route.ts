import { Router } from 'express';

import express from 'express';
import { SubscriptionController } from './subscribtion.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.post(
  '/subscribe',
  // auth(USER_ROLES.BRAND),
  SubscriptionController.createSubscription
);
router.post(
  '/renew',
  auth(USER_ROLES.BRAND),
  SubscriptionController.renewExpiredSubscription
);
router.patch(
  '/update',
  auth(USER_ROLES.BRAND),
  SubscriptionController.updateSubscription
);
router.delete(
  '/cancel',
  auth(USER_ROLES.BRAND),
  SubscriptionController.CancelSubscription
);
router.get('/get', SubscriptionController.getAllSubscriptation);

router.post(
  '/allHooks',
  express.raw({ type: 'application/json' }),
  SubscriptionController.webhookHandler
);

router.get(
  '/subscribe',

  SubscriptionController.createSession
);
router.get('/success', SubscriptionController.Success);
router.get('/customers/:id', SubscriptionController.customerPortal);

export const SubscriptionRoutes = router;
