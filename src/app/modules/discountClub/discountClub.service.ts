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
import { Category } from '../category/category.model';
import { populate } from 'dotenv';

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
  const { searchTerm, page, limit, userId, ...filterData } = query;
  const anyConditions: any[] = [];

  // Filter by searchTerm in categories if provided
  if (searchTerm) {
    const categoriesIds = await Category.find({
      $or: [{ categoryName: { $regex: searchTerm, $options: 'i' } }],
    }).distinct('_id');
    if (categoriesIds.length > 0) {
      anyConditions.push({ category: { $in: categoriesIds } });
    }
  }

  // Filter by userId if provided
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

  // Fetch DiscountClub data
  const result = await DiscountClub.find(whereConditions)
    .populate('category', 'categoryName')
    .populate({
      path: 'user',
      select: 'brand',
      populate: {
        path: 'brand',
        select: 'image owner',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await DiscountClub.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};
const getAllDiscountForOther = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [{ status: 'active' }];

  // Filter by searchTerm in categories if provided
  if (searchTerm) {
    const categoriesIds = await Category.find({
      $or: [{ categoryName: { $regex: searchTerm, $options: 'i' } }],
    }).distinct('_id');
    if (categoriesIds.length > 0) {
      anyConditions.push({ category: { $in: categoriesIds } });
    }
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

  // Fetch DiscountClub data
  const result = await DiscountClub.find(whereConditions)
    .populate('category', 'categoryName')
    .populate({
      path: 'user',
      select: 'brand',
      populate: {
        path: 'brand',
        select: 'image owner',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await DiscountClub.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const getSingleDiscount = async (id: string) => {
  const result = await DiscountClub.findById(id)
    .populate('category', 'categoryName')
    .populate({
      path: 'user',
      select: 'brand',
      populate: {
        path: 'brand',
        select: 'image owner',
      },
    });
  return result;
};

const updateDiscountToDB = async (
  id: string,
  payload: Partial<IDiscountClub>
) => {
  console.log(payload, 'dsddsd');

  const result = await DiscountClub.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const DiscountClubUpdateSatus = async (
  id: string,
  payload: Partial<IDiscountClub>
) => {
  const result = await DiscountClub.findByIdAndUpdate(
    id,
    { status: payload.status },
    { new: true, runValidators: true }
  );
  return result;
};

export const DiscountClubService = {
  createDiscountToDB,
  getAllDiscount,
  getSingleDiscount,
  updateDiscountToDB,
  DiscountClubUpdateSatus,
  getAllDiscountForOther,
};
