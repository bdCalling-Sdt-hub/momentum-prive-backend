import Stripe from 'stripe';
import QueryBuilder from '../../builder/QueryBuilder';
import { DiscountSearchAbleFields } from './discountClub.constant';
import { IDiscountClub } from './discountClub.interface';
import { DiscountClub } from './discountClub.model';
import config from '../../../config';
import { User } from '../user/user.model';
import dayjs from 'dayjs';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: '2024-09-30.acacia',
});

const createDiscountToDB = async (payload: Partial<IDiscountClub>) => {
  const isUser = await User.findById(payload.user);

  // Check if the user has the "Silver" title and an active subscription
  if (isUser?.title === 'Discount' && isUser.subscription === true) {
    // Calculate the start and end dates for the current month
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();

    // Count campaigns created by the user within the current month
    const monthlyDiscountCount = await DiscountClub.countDocuments({
      user: payload.user,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (monthlyDiscountCount >= 10) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Discount users can only create up to 10 discountClub per month.'
      );
    }
  }
  const campaign = await DiscountClub.create(payload);

  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();
  const monthlyDiscountCounts = await DiscountClub.countDocuments({
    user: payload.user,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  return { campaign, monthlyDiscountCounts };
};

const getAllDiscount = async (query: Record<string, unknown>) => {
  const discountBuilder = new QueryBuilder(
    DiscountClub.find().populate({
      path: 'user',
      populate: {
        path: 'brand',
      },
    }),
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
  const result = await DiscountClub.findById(id).populate({
    path: 'user',
    populate: {
      path: 'brand',
    },
  });
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
};
