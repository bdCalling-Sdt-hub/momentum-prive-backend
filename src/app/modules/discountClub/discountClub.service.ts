import Stripe from 'stripe';
import QueryBuilder from '../../builder/QueryBuilder';
import { DiscountSearchAbleFields } from './discountClub.constant';
import { IDiscountClub } from './discountClub.interface';
import { DiscountClub } from './discountClub.model';
import config from '../../../config';

const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: '2024-09-30.acacia',
});

const createDiscountToDB = async (payload: Partial<IDiscountClub>) => {
  const campaign = await DiscountClub.create(payload);
  return campaign;
};

// create payment for stripe

const createPaymentIntent = async (id: string, email: string) => {
  const discountClub = await DiscountClub.findById(id);

  if (!discountClub) {
    throw new Error('DiscountClub not found');
  }

  const amount = parseFloat(discountClub.price) * 100; // Stripe requires the amount in cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      discountClubId: discountClub._id.toString(),
      discountClubName: discountClub.name,
      email, // Add email to metadata
    },
    receipt_email: email, // Stripe will send a payment receipt email to this address
  });

  console.log(paymentIntent);
  return paymentIntent;
};

const getAllDiscount = async (query: Record<string, unknown>) => {
  const discountBuilder = new QueryBuilder(
    DiscountClub.find().populate('brand'),
    query
  )
    .search(DiscountSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await discountBuilder.modelQuery;
  return result;
};

const getSingleDiscount = async (id: string) => {
  const result = await DiscountClub.findById(id);
  return result;
};

const updateDiscountToDB = async (
  id: string,
  payload: Partial<IDiscountClub>
) => {
  const result = await DiscountClub.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deletedDiscountToDB = async (id: string) => {
  const result = await DiscountClub.findByIdAndUpdate(
    id,
    { status: 'delete' },
    { new: true, runValidators: true }
  );
  return result;
};

export const DiscountClubService = {
  createDiscountToDB,
  getAllDiscount,
  getSingleDiscount,
  updateDiscountToDB,
  deletedDiscountToDB,
  createPaymentIntent,
};
