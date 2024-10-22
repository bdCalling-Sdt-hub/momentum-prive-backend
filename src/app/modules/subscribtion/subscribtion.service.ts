import Stripe from 'stripe';
import config from '../../../config';

import handleCheckoutSessionCompleted from '../../../util/subscribationHelpar/handleCheckoutSessionCompleted';
import handleInvoicePaymentSucceeded from '../../../util/subscribationHelpar/handleInvoicePaymentSucceeded';
import handleSubscriptionUpdated from '../../../util/subscribationHelpar/handleSubscriptionUpdated';
import { Subscribation } from './subscribtion.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

export const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: '2024-09-30.acacia',
});
const createCheckoutSession = async (plan: string) => {
  let priceId: string;

  switch (plan) {
    case 'silver':
      priceId = 'price_1QCEkrLMVhw2FMhmSk9vFt8I';
      break;
    case 'gold':
      priceId = 'price_1QCEjiLMVhw2FMhmlNP5l4uU';
      break;
    case 'discount':
      priceId = 'price_1QCEloLMVhw2FMhmnDUnFb5C';
      break;
    default:
      throw new Error('Subscribe plan not found');
  }

  // golde=price_1QBC03LMVhw2FMhm8Cz0srZZ
  // silver=price_1QBBzCLMVhw2FMhmLXzkcML7
  // pro=price_1QBagbLMVhw2FMhmsaXzQPsn

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url:
      'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:3000/cancel',
  });

  return session;
};

const retrieveSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });
};

const createBillingPortal = async (customerId: string) => {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `http://localhost:3000/`,
  });

  return portalSession;
};

const handleWebhook = async (event: any) => {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionUpdated(event.data.object);
      break;
    default:
      console.log('Unhandled event type: ', event.type);
      break;
  }
};

// subscription.service.ts

const createCustomerAndSubscription = async (
  email: string,
  priceId: string
) => {
  // Create customer
  const customer = await stripe.customers.create({
    email,
  });

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
  console.log(subscription);
  // Check if latest_invoice exists and is of type Invoice
  const latestInvoice = subscription.latest_invoice;

  if (!latestInvoice || typeof latestInvoice === 'string') {
    throw new Error(
      'Failed to create subscription; latest_invoice is missing or is invalid.'
    );
  }

  // Check if payment_intent exists and is of type PaymentIntent
  const paymentIntent = latestInvoice.payment_intent;

  if (!paymentIntent || typeof paymentIntent === 'string') {
    throw new Error('Failed to retrieve payment intent from latest_invoice.');
  }

  const createSub = await Subscribation.create({
    email,
    priceId,
    transactionId: paymentIntent.id,
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
  });

  if (!createSub) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create subscription.'
    );
  }

  return {
    transactionId: paymentIntent.id,
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
  };
};

// const updateustomerAndSubscription = async (
//   subscriptionId: string,
//   newPriceId: string
// ) => {
//   // Check if the subscriptionId exists in the database
//   const existingSub = await Subscribation.findOne({ subscriptionId });
// console.log(existingSub)
//   if (!existingSub) {
//     throw new Error('No subscription found with the provided subscriptionId.');
//   }

//   // Retrieve the subscription from Stripe
//   const subscription = await stripe.subscriptions.retrieve(subscriptionId);

//   if (!subscription) {
//     throw new Error('Subscription not found on Stripe.');
//   }

//   // Update the subscription on Stripe with the new priceId
//   const updatedSubscription = await stripe.subscriptions.update(
//     subscriptionId,
//     {
//       items: [
//         {
//           id: subscription.items.data[0].id, // Use the existing subscription item ID
//           price: newPriceId, // New plan/price ID
//         },
//       ],
//       proration_behavior: 'create_prorations', // Handles prorating the amount
//       expand: ['latest_invoice.payment_intent'],
//     }
//   );

//   // Retrieve the latest invoice and payment intent
//   const latestInvoice = updatedSubscription.latest_invoice;

//   if (!latestInvoice || typeof latestInvoice === 'string') {
//     throw new Error(
//       'Failed to update subscription; latest_invoice is missing or is invalid.'
//     );
//   }

//   const paymentIntent = latestInvoice.payment_intent;

//   if (!paymentIntent || typeof paymentIntent === 'string') {
//     throw new Error('Failed to retrieve payment intent from latest_invoice.');
//   }

//   // Update the local database with the new priceId and transaction information
//   existingSub.priceId = newPriceId; // Update the priceId
//   existingSub.transactionId = paymentIntent.id; // Update the transactionId
//   existingSub.clientSecret = paymentIntent.client_secret; // Update the clientSecret
//   await existingSub.save(); // Save the updated subscription data

//   const createSub = await Subscribation.create({
//     transactionId: paymentIntent.id,
//     subscriptionId: subscription.id,
//     clientSecret: paymentIntent.client_secret,
//   });

//   return {
//     transactionId: paymentIntent.id,
//     subscriptionId: updatedSubscription.id,
//     clientSecret: paymentIntent.client_secret,
//   };
// };

const updateustomerAndSubscription = async (
  newPriceId: string,
  subscriptionId: string
) => {
  console.log(subscriptionId);
  // Check if the subscription exists in the database
  const isExistSubId = await Subscribation.findOne({ subscriptionId });

  console.log(isExistSubId);

  if (!isExistSubId) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Subscription not found in the database.'
    );
  }

  // Retrieve the existing subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (!subscription) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Subscription not found in Stripe.'
    );
  }
  console.log(subscription.status);
  if (subscription.status === 'incomplete') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Cannot update subscription in incomplete status. Finalize the payment first.'
    );
  }

  // Update the subscription in Stripe with the new priceId
  const updatedSubscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      items: [
        {
          id: subscription.items.data[0].id, // Existing subscription item ID
          price: newPriceId,
        },
      ],
      expand: ['latest_invoice.payment_intent'],
    }
  );
  console.log(updatedSubscription);
  // Check if the latest_invoice and payment_intent exist in the updated subscription
  const latestInvoice = updatedSubscription.latest_invoice;
  if (!latestInvoice || typeof latestInvoice === 'string') {
    throw new Error(
      'Failed to update subscription; latest_invoice is missing or is invalid.'
    );
  }

  const paymentIntent = latestInvoice.payment_intent;
  if (!paymentIntent || typeof paymentIntent === 'string') {
    throw new Error('Failed to retrieve payment intent from latest_invoice.');
  }

  // Update the subscription details in the database
  const updatedSub = await Subscribation.findOneAndUpdate(
    { subscriptionId },
    {
      priceId: newPriceId, // Update to the new price ID
      transactionId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: updatedSubscription.status,
      currentPeriodEnd: updatedSubscription.current_period_end,
      currentPeriodStart: updatedSubscription.current_period_start,
    },
    { new: true } // Return the updated document
  );

  if (!updatedSub) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update subscription record in the database.'
    );
  }

  return {
    subscriptionId: updatedSubscription.id,
    transactionId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: updatedSubscription.status,
    updatedSub,
  };
};

const cancelSubscription = async (subscriptionId: string) => {
  // Check if the subscription exists in the database
  const isExistSubId = await Subscribation.findOne({ subscriptionId });

  if (!isExistSubId) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Subscription not found in the database.'
    );
  }

  // Update the subscription to cancel at the end of the period
  const updatedSubscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      cancel_at_period_end: true,
    }
  );

  // Update the subscription details in the database
  const updatedSub = await Subscribation.findOneAndUpdate(
    { subscriptionId },
    {
      status: updatedSubscription.status, // Update status accordingly
      currentPeriodEnd: updatedSubscription.current_period_end,
      currentPeriodStart: updatedSubscription.current_period_start,
    },
    { new: true } // Return the updated document
  );

  if (!updatedSub) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update subscription record in the database.'
    );
  }

  return {
    subscriptionId: updatedSubscription.id,
    status: updatedSubscription.status,
    updatedSub,
  };
};

const renewExpiredSubscriptions = async (subscriptionId: string) => {
  const subscriptionRecord = await Subscribation.findOne({ subscriptionId });

  if (!subscriptionRecord) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Subscription not found in the database.'
    );
  }

  const currentPeriodEnd = subscriptionRecord.currentPeriodEnd;

  console.log('currentPeriodEnd:', currentPeriodEnd); // Log the value to see what it is

  if (!currentPeriodEnd) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Current period end is missing.'
    );
  }

  // Convert Unix timestamp (seconds) to Date (milliseconds)
  const currentPeriodEndDate = new Date(Number(currentPeriodEnd) * 1000);

  // Check if currentPeriodEndDate is valid
  if (isNaN(currentPeriodEndDate.getTime())) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Current period end is not a valid date.'
    );
  }

  const now = new Date();
  if (currentPeriodEndDate >= now) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Subscription is still active and does not need renewal.'
    );
  }

  // Retrieve the existing subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscriptionId
  );

  // Check if the subscription is valid and can be renewed
  if (!stripeSubscription || stripeSubscription.status !== 'active') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid or inactive subscription.'
    );
  }

  // Renew the subscription in Stripe
  const renewedSubscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      items: [
        {
          id: stripeSubscription.items.data[0].id, // Existing subscription item ID
          price: subscriptionRecord.priceId, // Use the same price ID or a new one if applicable
        },
      ],
      expand: ['latest_invoice.payment_intent'], // To get the latest invoice details
    }
  );

  // Update the subscription details in the database
  const updatedSub = await Subscribation.findOneAndUpdate(
    { subscriptionId: subscriptionId },
    {
      currentPeriodStart: renewedSubscription.current_period_start,
      currentPeriodEnd: renewedSubscription.current_period_end,
      status: renewedSubscription.status,
    },
    { new: true }
  );

  if (!updatedSub) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update subscription record in the database.'
    );
  }

  return {
    subscriptionId: renewedSubscription.id,
    status: renewedSubscription.status,
    updatedSub,
  };
};

export const subscriptionService = {
  createCheckoutSession,
  retrieveSession,
  createBillingPortal,
  handleWebhook,
  createCustomerAndSubscription,
  updateustomerAndSubscription,
  cancelSubscription,
  renewExpiredSubscriptions,
};
