import { Router } from 'express';

import express from 'express';
import { SubscriptionController } from './subscribtion.controller';

const router = Router();

router.post('/subscribe', SubscriptionController.createSubscription);
router.post('/renew', SubscriptionController.renewExpiredSubscription);
router.patch('/update', SubscriptionController.updateSubscription);
router.delete('/cancel', SubscriptionController.CancelSubscription);

router.post(
  '/allHooks',
  express.raw({ type: 'application/json' }),
  SubscriptionController.webhookHandler
);

router.get('/subscribe', SubscriptionController.createSession);
router.get('/success', SubscriptionController.Success);
router.get('/customers/:id', SubscriptionController.customerPortal);

export const SubscriptionRoutes = router;
