import Stripe from 'stripe';
import config from '../../../config';

import handleCheckoutSessionCompleted from '../../../util/subscribationHelpar/handleCheckoutSessionCompleted';
import handleInvoicePaymentSucceeded from '../../../util/subscribationHelpar/handleInvoicePaymentSucceeded';
import handleSubscriptionUpdated from '../../../util/subscribationHelpar/handleSubscriptionUpdated';
import { Subscribation } from './subscribtion.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { formatDate } from './timeFormat';
import { User } from '../user/user.model';
import { Package } from '../package/package.model';

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
  priceId: string,
  user: string,
  packages: string
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

  const priceAmount = subscription.items.data[0]?.price?.unit_amount ?? 0;

  const price = priceAmount / 100;

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
    // transactionId: paymentIntent.id,
    subscriptionId: subscription.id,
    status: subscription.status,
    // clientSecret: paymentIntent.client_secret,
    currentPeriodStart: formatDate(
      new Date(subscription.current_period_start * 1000)
    ),
    currentPeriodEnd: formatDate(
      new Date(subscription.current_period_end * 1000)
    ),
    priceAmount: price,
    user,
    packages,
  });

  const isPackageExist = await Package.findOne({ _id: packages });

  const isPackage = isPackageExist?.title;

  if (createSub) {
    // Find and update the user based on the id
    const updateUserSubs = await User.findByIdAndUpdate(
      user,
      { $set: { subscription: true, title: isPackage } },
      { new: true }
    );

    if (!updateUserSubs) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update user subscription.'
      );
    }

    if (!createSub) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create subscription.'
      );
    }
  }

  return {
    transactionId: paymentIntent.id,
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
    createSub,
  };
};

const getAllSubscriptation = async () => {
  const result = await Subscribation.find()
    .populate({
      path: 'user',
      populate: {
        path: 'brand',
      },
    })
    .populate('packages');
  return result;
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
  // Check if the subscription exists in the database
  const isExistSubId = await Subscribation.findOne({ subscriptionId });

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
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      expand: ['latest_invoice.payment_intent'],
    }
  );

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
      // priceId: newPriceId, // Update to the new price ID

      status: updatedSubscription.status,

      currentPeriodEnd: formatDate(
        new Date(updatedSubscription.current_period_end * 1000)
      ),
      currentPeriodStart: formatDate(
        new Date(updatedSubscription.current_period_start * 1000)
      ),
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
      status: updatedSubscription.cancellation_details?.reason,

      currentPeriodStart: formatDate(
        new Date(updatedSubscription.current_period_start * 1000)
      ),
      currentPeriodEnd: formatDate(
        new Date(updatedSubscription.current_period_end * 1000)
      ),
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
    subscriptionId: updatedSubscription.id,
    status: updatedSubscription.status,
    updatedSub,
  };
};

// const renewExpiredSubscriptions = async (
//   subscriptionId: string,
//   newPriceId?: string // Make newPriceId optional
// ) => {
//   // Find subscription record in the database
//   const subscriptionRecord = await Subscribation.findOne({ subscriptionId });

//   if (!subscriptionRecord) {
//     throw new ApiError(
//       StatusCodes.NOT_FOUND,
//       'Subscription not found in the database.'
//     );
//   }

//   // Check if the status is "expired"
//   if (subscriptionRecord.status !== 'expired') {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Subscription is not expired and cannot be renewed.'
//     );
//   }

//   // Retrieve the existing subscription from Stripe
//   const stripeSubscription = await stripe.subscriptions.retrieve(
//     subscriptionId
//   );

//   // Check if the subscription is valid
//   if (!stripeSubscription || stripeSubscription.status !== 'active') {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Invalid or inactive subscription.'
//     );
//   }

//   // Determine the price to use
//   const priceIdToUse = newPriceId || stripeSubscription.items.data[0].price.id;

//   // Retrieve the customer payment methods
//   const customerId =
//     typeof stripeSubscription.customer === 'string'
//       ? stripeSubscription.customer
//       : stripeSubscription.customer.id;

//   const paymentMethods = await stripe.paymentMethods.list({
//     customer: customerId,
//     type: 'card', // Adjust if you're using a different type of payment method
//   });

//   if (paymentMethods.data.length === 0) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'This customer has no attached payment source or default payment method.'
//     );
//   }

//   // Use the first payment method or set a default
//   const paymentMethodId = paymentMethods.data[0].id; // Get the first payment method

//   // Create a new subscription in Stripe
//   const newSubscription = await stripe.subscriptions.create({
//     customer: customerId, // Customer ID as a string
//     items: [{ price: priceIdToUse }],
//     default_payment_method: paymentMethodId, // Attach the payment method
//     expand: ['latest_invoice.payment_intent'], // Get the latest invoice details
//   });

//   // Update the subscription details in the database
//   const priceAmount = newSubscription.items.data[0]?.price?.unit_amount ?? 0;
//   const price = priceAmount / 100;

//   console.log(price);

//   // Save the new subscription record in the database
//   const newSubscriptionRecord = await Subscribation.create({
//     subscriptionId: newSubscription.id,
//     status: newSubscription.status,
//     priceAmount: price,
//     // Add other relevant fields from your subscription model
//   });

//   if (!newSubscriptionRecord) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Failed to create new subscription record in the database.'
//     );
//   }

//   // Optionally, you might want to update the previous subscription record status to "canceled" or "renewed"
//   await Subscribation.findOneAndUpdate(
//     { subscriptionId },
//     { status: 'canceled' }, // Or however you want to handle the old subscription
//     { new: true }
//   );

//   return {
//     subscriptionId: newSubscription.id,
//     status: newSubscription.status,
//     newSubscriptionRecord,
//   };
// };

const renewExpiredSubscriptions = async (
  subscriptionId: string,
  newPriceId?: string // Make newPriceId optional
) => {
  // Find subscription record in the database
  const subscriptionRecord = await Subscribation.findOne({ subscriptionId });

  if (!subscriptionRecord) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Subscription not found in the database.'
    );
  }

  // Check if the status is "expired"
  if (subscriptionRecord.status !== 'expired') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Subscription is not expired and cannot be renewed.'
    );
  }

  // Retrieve the existing subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscriptionId
  );

  // Check if the subscription is valid
  if (!stripeSubscription || stripeSubscription.status !== 'active') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid or inactive subscription.'
    );
  }

  // Prepare the customer ID
  const customerId =
    typeof stripeSubscription.customer === 'string'
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id;

  // Ensure a customer ID is available
  if (!customerId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No valid customer found for the subscription.'
    );
  }

  let amountToCharge: number;
  let currency: string;

  if (newPriceId) {
    // If a new price ID is provided, retrieve the new price details
    const newPrice = await stripe.prices.retrieve(newPriceId);

    // Ensure newPrice and its unit_amount are valid
    if (!newPrice || newPrice.unit_amount === null) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Invalid new price ID or unit amount is null.'
      );
    }

    amountToCharge = newPrice.unit_amount;
    currency = newPrice.currency;
  } else {
    // If no new price ID, use the existing invoice
    const latestInvoice = stripeSubscription.latest_invoice;
    if (!latestInvoice || typeof latestInvoice === 'string') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No latest invoice found for the subscription.'
      );
    }

    if (latestInvoice.amount_due === null) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Latest invoice amount_due is null.'
      );
    }

    amountToCharge = latestInvoice.amount_due;
    currency = latestInvoice.currency;
  }

  // Retrieve the default payment method
  const paymentMethodId =
    typeof stripeSubscription.default_payment_method === 'string'
      ? stripeSubscription.default_payment_method
      : undefined;

  // Ensure paymentMethodId is valid
  if (!paymentMethodId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No valid payment method found for the subscription.'
    );
  }

  // Create the payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountToCharge,
    currency: currency,
    customer: customerId,
    // payment_method: 'Subscription creation',
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
  });

  // Check if the payment was successful
  if (paymentIntent.status !== 'succeeded') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Payment failed. Please try again.'
    );
  }

  const updatedSub = await Subscribation.findOneAndUpdate(
    { subscriptionId },
    {
      status: 'active',
      priceAmount: amountToCharge / 100,
      currentPeriodStart: formatDate(new Date()),
      currentPeriodEnd: formatDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
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
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    updatedSub,
  };
};

// const renewExpiredSubscriptions = async (
//   subscriptionId: string,
//   newPriceId?: string // Make newPriceId optional
// ) => {
//   // Find subscription record in the database
//   const subscriptionRecord = await Subscribation.findOne({ subscriptionId });

//   if (!subscriptionRecord) {
//     throw new ApiError(
//       StatusCodes.NOT_FOUND,
//       'Subscription not found in the database.'
//     );
//   }

//   // Check if the status is "expired"
//   if (subscriptionRecord.status !== 'expired') {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Subscription is not expired and cannot be renewed.'
//     );
//   }

//   // Retrieve the existing subscription from Stripe
//   const stripeSubscription = await stripe.subscriptions.retrieve(
//     subscriptionId
//   );

//   // Check if the subscription is valid
//   if (!stripeSubscription || stripeSubscription.status !== 'active') {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Invalid or inactive subscription.'
//     );
//   }

//   // Determine the price to use
//   const priceIdToUse = newPriceId || stripeSubscription.items.data[0].price.id;

//   // Retrieve the customer payment methods
//   const customerId =
//     typeof stripeSubscription.customer === 'string'
//       ? stripeSubscription.customer
//       : stripeSubscription.customer.id;

//   const paymentMethods = await stripe.paymentMethods.list({
//     customer: customerId,
//     type: 'card', // Adjust if you're using a different type of payment method
//   });

//   if (paymentMethods.data.length === 0) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'This customer has no attached payment source or default payment method.'
//     );
//   }

//   // Use the first payment method
//   const paymentMethodId = paymentMethods.data[0].id; // Get the first payment method

//   // Update the existing subscription in Stripe
//   const updatedSubscription = await stripe.subscriptions.update(
//     subscriptionId,
//     {
//       items: [
//         {
//           id: stripeSubscription.items.data[0].id, // Existing subscription item ID
//           price: priceIdToUse, // Use the new price ID or the existing one
//         },
//       ],
//       default_payment_method: paymentMethodId, // Attach the payment method
//       expand: ['latest_invoice.payment_intent'], // Get the latest invoice details
//     }
//   );

//   // Update the subscription details in the database
//   const priceAmount =
//     updatedSubscription.items.data[0]?.price?.unit_amount ?? 0;
//   const price = priceAmount / 100;

//   const updatedSub = await Subscribation.findOneAndUpdate(
//     { subscriptionId },
//     {
//       status: updatedSubscription.status,
//       priceAmount: price,

//       currentPeriodStart: formatDate(
//         new Date(updatedSubscription.current_period_start * 1000)
//       ),
//       currentPeriodEnd: formatDate(
//         new Date(updatedSubscription.current_period_end * 1000)
//       ),
//       // Add any other fields you want to update
//     },
//     { new: true }
//   );

//   if (!updatedSub) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Failed to update subscription record in the database.'
//     );
//   }

//   return {
//     subscriptionId: updatedSubscription.id,
//     status: updatedSubscription.status,
//     updatedSub,
//   };
// };

export const subscriptionService = {
  createCheckoutSession,
  retrieveSession,
  createBillingPortal,
  handleWebhook,
  createCustomerAndSubscription,
  updateustomerAndSubscription,
  cancelSubscription,
  renewExpiredSubscriptions,
  getAllSubscriptation,
};
