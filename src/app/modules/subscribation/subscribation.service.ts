import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

import { ISubscriptation } from './subscribation.interface';
import { Subscriptation } from './subscribation.model';
import Stripe from 'stripe';
import config from '../../../config';

export const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: '2024-09-30.acacia',
});

const createSubscriptationToDB = async (data: ISubscriptation) => {
  const result = await Subscriptation.create(data);
  return result;
};

const getAllSubscriptation = async () => {
  const result = await Subscriptation.find().populate({
    path: 'brand',
    populate: {
      path: 'brand',
    },
  });
  return result;
};

const createPaymentStripeService = async (
  payload: any,
  req: Request
): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
  const { products } = payload;

  // Log the incoming payload for debugging
  console.log('Received Payload:', payload);
  console.log('Querying for priceId:', products[0].priceId); // Log the priceId being queried

  // Query the subscription by priceId
  const orderDetails = await Subscriptation.findOne({
    priceId: products[0].priceId, // Ensure you're using the correct index
  });

  // Log the order details fetched
  console.log('Order Details Fetched:', orderDetails);

  // Handle errors for missing or deactivated subscriptions
  if (!orderDetails) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription not found');
  } else if (orderDetails.status === 'deleted') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Subscription is deactivated');
  }

  // Get the price from the database
  const databasePrice = parseInt(orderDetails.price, 10); // Assuming price is stored as a string in the database
  console.log('Database Price:', databasePrice);

  // Fetch all prices from Stripe to find a matching price ID
  const prices = await stripe.prices.list({
    active: true,
  });

  // Find the Stripe price ID that matches the database price
  const matchingPrice = prices.data.find(price => {
    return (
      price.unit_amount === databasePrice * 100 &&
      price.currency === (products[0].currency || 'usd')
    );
  });

  // Handle cases where no matching price is found
  if (!matchingPrice) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Matching Stripe price not found'
    );
  }

  // Log the matching Stripe price ID
  console.log('Matching Stripe Price Found:', matchingPrice.id);

  // Prepare metadata to store with the Stripe session
  const currentDate = new Date();
  const newDate = new Date(currentDate.setDate(currentDate.getDate() + 30)); // Set the end date for the subscription

  const metadata = {
    subId: orderDetails._id.toString(),
    userId: orderDetails.brand.toString(),
    startDate: currentDate.toISOString(),
    endDate: newDate.toISOString(),
  };

  // Log metadata for debugging
  console.log('Stripe Session Metadata:', metadata);

  // Create the Stripe Checkout session for subscription
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: matchingPrice.id, // Use the matched Stripe price ID
        quantity: 1,
      },
    ],
    mode: 'subscription', // Change mode to subscription
    success_url: `http://localhost:5000/api/v1/subscriptation/success?session_id={CHECKOUT_SESSION_ID}&priceId=${matchingPrice.id}`, // Use the matched price ID
    cancel_url: `http://localhost:5000/api/v1/subscriptation/cancel?priceId=${matchingPrice.id}`, // Use the matched price ID
    metadata,
  });

  // Log session details for debugging
  console.log('Stripe Session Created:', session);

  return session;
};

export const SubscriptationService = {
  createSubscriptationToDB,
  getAllSubscriptation,
  createPaymentStripeService,
};
