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
      priceId = 'price_1QMpqdLMVhw2FMhmPIUvtr7X';
      break;
    case 'gold':
      priceId = 'price_1QMppyLMVhw2FMhmQTrE5gIZ';
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

const createCustomerAndSubscription = async (
  // email: string,
  // priceId: string,
  user: string,
  packages: string
) => {
  const pack = await Package.findById(packages);

  const priceId = pack?.productId;

  const users = await User.findById(user);

  const email = users?.email;

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
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Invalid latest invoice format.'
    );
  }

  // Check if payment_intent exists and is of type PaymentIntent
  const paymentIntent = latestInvoice.payment_intent;

  if (!paymentIntent || typeof paymentIntent === 'string') {
    throw new Error('Failed to retrieve payment intent from latest_invoice.');
  }

  const allSubscriptationValue = {
    transactionId: paymentIntent.id,
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
  };

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

  return {
    allSubscriptationValue,
    createSub,
  };
};

const handlePaymentSuccess = async (userId: string, subscriptionId: string) => {
  // Retrieve the PaymentIntent from Stripe

  // Update the subscription status to 'active' in your Subscribation model
  const updatedSub = await Subscribation.updateOne(
    { user: userId },
    { status: 'active' } // Mark as 'active' after successful payment
  );

  const issubs = await Subscribation.findOne({
    user: userId,
  });

  const packages = issubs?.packages;

  const isPackageExist = await Package.findOne({ _id: packages });

  const isPackage = isPackageExist?.title;

  console.log(isPackage);

  if (updatedSub) {
    // Find and update the user based on the id
    const updateUserSubs = await User.findByIdAndUpdate(
      userId,
      { $set: { subscription: true, title: isPackage } },
      { new: true }
    );

    if (!updateUserSubs) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update user subscription.'
      );
    }

    if (!updatedSub) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create subscription.'
      );
    }
  }

  return updatedSub;
};

const getAllSubscriptation = async () => {
  const result = await Subscribation.find({ status: 'active' })
    .populate({
      path: 'user',
      populate: {
        path: 'brand',
      },
    })
    .populate('packages');
  return result;
};

const getAllSubscriptationForBrand = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, userId, ...filterData } = query;
  const anyConditions: any[] = [];

  // Add searchTerm condition if present

  if (userId) {
    anyConditions.push({ user: userId });
  }

  // Filter by additional filterData fields
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch Category data
  const result = await Subscribation.find(whereConditions)
    .populate({
      path: 'user',
      populate: {
        path: 'brand',
      },
    })
    .populate('packages')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Subscribation.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const updateustomerAndSubscription = async (
  packages: string,
  userId: string
) => {
  const subs = await Subscribation.findOne({ user: userId });

  const pack = await Package.findById(packages);

  const newPriceId = pack?.productId;

  const subsId: any = subs?.subscriptionId;

  // Check if the subscription exists in the database
  const isExistSubId = await Subscribation.findOne({ user: userId });

  if (!isExistSubId) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Subscription not found in the database.'
    );
  }

  // Retrieve the existing subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(subsId);

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
  const updatedSubscription = await stripe.subscriptions.update(subsId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    expand: ['latest_invoice.payment_intent'],
  });

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
    { subscriptionId: subsId },
    {
      // priceId: newPriceId, // Update to the new price ID

      status: updatedSubscription.status,
      priceAmount: paymentIntent.amount / 100,
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

  const isPackageExist = await Package.findOne({ _id: packages });

  const isPackage = isPackageExist?.title;

  if (updatedSub) {
    // Find and update the user based on the id
    const updateUserSubs = await User.findByIdAndUpdate(
      userId,
      { $set: { subscription: true, title: isPackage } },
      { new: true }
    );

    if (!updateUserSubs) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update user subscription.'
      );
    }

    if (!updateUserSubs) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create subscription.'
      );
    }
  }

  return {
    subscriptionId: updatedSubscription.id,
    transactionId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: updatedSubscription.status,
    updatedSub,
  };
};

const cancelSubscription = async (userId: string) => {
  const subs = await Subscribation.findOne({ user: userId });

  const subsId: any = subs?.subscriptionId;

  // Check if the subscription exists in the database
  const isExistSubId = await Subscribation.findOne({ user: userId });

  if (!isExistSubId) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Subscription not found in the database.'
    );
  }

  // Update the subscription to cancel at the end of the period
  const updatedSubscription = await stripe.subscriptions.update(subsId, {
    cancel_at_period_end: true,
  });

  // Update the subscription details in the database
  const updatedSub = await Subscribation.findOneAndUpdate(
    { subscriptionId: subsId },
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

const renewExpiredSubscriptions = async (
  userId: string,
  packages?: string // Make newPriceId optional
) => {
  const pack = await Package.findById(packages);

  const newPriceId = pack?.productId;

  const subs = await Subscribation.findOne({ user: userId });

  const subsId: any = subs?.subscriptionId;

  // Find subscription record in the database
  const subscriptionRecord = await Subscribation.findOne({ user: userId });

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
  const stripeSubscription = await stripe.subscriptions.retrieve(subsId);

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
    { subscriptionId: subsId },
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
  getAllSubscriptationForBrand,
  handlePaymentSuccess,
};
