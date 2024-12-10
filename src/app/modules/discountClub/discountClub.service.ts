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
import { Subscribation } from '../subscribtion/subscribtion.model';
import unlinkFile from '../../../shared/unlinkFile';

const createDiscountToDB = async (payload: Partial<IDiscountClub>) => {
  const isUser = await User.findById(payload.user);

  const isSubs: any = await Subscribation.findOne({
    user: payload.user,
  }).populate('packages', 'limit');

  // Get the current month's start and end dates
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();

  // Count campaigns created by the user in the current month
  const isCamps = await DiscountClub.countDocuments({
    user: payload.user,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  if (isSubs?.packages?.limit) {
    if (isCamps >= Number(isSubs.packages.limit)) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        `${isUser?.title} users can only create up to ${Number(
          isSubs.packages.limit
        )} discountClub per month.`
      );
    }
  }

  if (!isUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Check if the user has the "Silver" title and an active subscription

  const campaign = await DiscountClub.create(payload);

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
      },
    });
  return result;
};

const updateDiscountToDB = async (
  id: string,
  payload: Partial<IDiscountClub>
) => {
  const isExistDiscount = await DiscountClub.findById(id);
  if (!isExistDiscount) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Discount not found');
  }

  if (payload.image && isExistDiscount.image) {
    unlinkFile(isExistDiscount.image);
  }

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
