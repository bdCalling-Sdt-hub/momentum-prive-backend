import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICampaign } from './campaign.interface';
import { Campaign } from './campaign.model';
import { Collaborate } from '../collaboration/collaboration.model';
import { Brand } from '../brand/brand.model';
import { Category } from '../category/category.model';
import { User } from '../user/user.model';
import dayjs from 'dayjs';

import { Subscribation } from '../subscribtion/subscribtion.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Influencer } from '../influencer/influencer.model';
import { buildDateFilter } from '../../../helpers/timeHelper';
import unlinkFile from '../../../shared/unlinkFile';

const createCampaignToDB = async (payload: Partial<ICampaign>) => {
  const isCategoryOfBrand = await User.findById(payload.user);

  const isSubs: any = await Subscribation.findOne({
    user: payload.user,
  }).populate('packages', 'limit');

  // Get the current month's start and end dates
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();

  // Count campaigns created by the user in the current month
  const isCamps = await Campaign.countDocuments({
    user: payload.user,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  if (isSubs?.packages?.limit) {
    if (isCamps >= Number(isSubs.packages.limit)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `${isCategoryOfBrand?.title} users can only create up to ${Number(
          isSubs.packages.limit
        )} campaigns per month.`
      );
    }
  }

  // Convert collaborationLimit to a number, defaulting to 0 if undefined or invalid
  const collaborationLimit = Number(payload.collaborationLimit) || 0;

  const isBrandOfCat = await Brand.findById(isCategoryOfBrand?.brand);
  const isCategoryName = isBrandOfCat?.category;

  payload.collaborationLimit = collaborationLimit;

  // Create the campaign with the associated category
  const campaign = await Campaign.create({
    ...payload,
    category: isCategoryName,
  });

  // Count updated campaigns after creating the new one
  const CampaignsCount = await Campaign.countDocuments({
    user: payload.user,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  if (campaign) {
    const bookingData = {
      text: `Campaign created plase check all information`,
      name: isSubs?.user?.firstName,
      type: 'ADMIN',
    };
    await sendNotifications(bookingData);
  }

  return { campaign, CampaignsCount };
};

const getAllCampaigns = async (query: Record<string, unknown>) => {
  const { searchTerm, name, page, limit, ...filterData } = query;
  const anyConditions: any[] = [
    { status: 'active' },
    { approvalStatus: 'Approved' },
  ];

  // Filter by searchTerm in categories if provided
  if (searchTerm) {
    const categoriesIds = await Category.find({
      $or: [{ categoryName: { $regex: searchTerm, $options: 'i' } }],
    }).distinct('_id');
    if (categoriesIds.length > 0) {
      anyConditions.push({ category: { $in: categoriesIds } });
    }
  }

  if (name) {
    anyConditions.push({
      $or: [{ name: { $regex: name, $options: 'i' } }],
    });
  }

  // Filter by additional filterData fields
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  if (filterData.endTime) {
    const specifiedDate = new Date(filterData.endTime as string);
    const startOfDay = new Date(
      specifiedDate.getFullYear(),
      specifiedDate.getMonth(),
      specifiedDate.getDate()
    ); // Start of the specified day (midnight)
    const endOfDay = new Date(
      specifiedDate.getFullYear(),
      specifiedDate.getMonth(),
      specifiedDate.getDate(),
      23,
      59,
      59,
      999
    ); // End of the specified day (11:59:59 PM)

    anyConditions.push({
      endTime: {
        $gte: startOfDay.toISOString(), // Start of the day
        $lte: endOfDay.toISOString(), // End of the day
      },
    });
  }

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch campaigns
  const result = await Campaign.find(whereConditions)
    .populate('category', 'categoryName')
    .populate({
      path: 'user',
      select: 'brand ',
      populate: {
        path: 'brand',
        select: 'image owner',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Campaign.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};
const getAllCampaignsForAdmin = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  // Check if searchTerm is provided
  if (searchTerm) {
    const brandIds = await Brand.find({
      owner: { $regex: searchTerm, $options: 'i' },
    }).distinct('_id');

    if (brandIds.length > 0) {
      const userIds = await User.find({
        brand: { $in: brandIds },
      }).distinct('_id');

      if (userIds.length > 0) {
        anyConditions.push({ user: { $in: userIds } });
      }
    }
  }

  // If no user matches the brand search, check for campaign name
  if (searchTerm && anyConditions.length === 0) {
    const campaignNameCondition = {
      name: { $regex: searchTerm, $options: 'i' },
    };

    anyConditions.push(campaignNameCondition);
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

  // Fetch campaigns with the combined conditions
  const result = await Campaign.find(whereConditions)
    .populate('category', 'categoryName')
    .populate({
      path: 'user',
      select: 'brand fullName',
      populate: { path: 'brand', select: 'image owner' },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Campaign.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const getSingleCmpaign = async (id: string) => {
  const result = await Campaign.findById(id)
    .populate({
      path: 'user',
      select: 'brand',
      populate: {
        path: 'brand',
      },
    })
    .populate({
      path: 'category',
      select: 'categoryName',
    });

  if (result === null) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  return result;
};

const updateCampaignToDB = async (id: string, payload: Partial<ICampaign>) => {
  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'campaign not found');
  }

  if (payload.image && campaign.image) {
    unlinkFile(campaign.image);
  }

  const campUser = await User.findById(campaign.user);

  if (campaign.status !== 'active') {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Campaign is not active, cannot be updated'
    );
  }

  payload.approvalStatus = 'Pending';

  const result = await Campaign.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (result?.status === 'active') {
    const bookingData = {
      text: `Campaign updated plase check all information`,
      name: campUser?.fullName,
      type: 'ADMIN',
    };
    await sendNotifications(bookingData);
  }

  return result;
};

const deletedCampaignToDB = async (id: string) => {
  const result = await Campaign.findByIdAndUpdate(
    id,
    { status: 'delete' },
    { new: true, runValidators: true }
  );
  return result;
};

const getCampaignforBrand = async (brandId: string) => {
  // Fetch subscriptions with populated 'packages' including the 'limit' field
  const subs: any = await Subscribation.find({ user: brandId }).populate({
    path: 'packages',
    select: 'limit',
  });

  if (subs.length === 0) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Brand not subscribed');
  }

  // Access the 'limit' field from the populated 'packages'
  const limit: any = subs[0]?.packages?.limit;

  if (limit === undefined) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Package limit not found'
    );
  }

  // Fetch campaigns for the brand
  const campaigns = await Campaign.find({
    user: brandId,
    status: 'active',
  }).populate('user', 'brand');

  const count = campaigns.length;

  return { campaigns, count, limit };
};

const getCampaignforAllData = async (brandId: string) => {
  const campaigns = await Campaign.find({
    user: brandId,
    status: 'active',
    approvalStatus: 'Approved',
  }).select('name');

  const count = campaigns.length;

  return { campaigns, count };
};

const getAllCampaignForInfluencer = async (
  query: Record<string, unknown>,
  userGender: string
) => {
  const users = await User.findById(userGender);
  if (!users || !users.influencer) {
    throw new Error('User or influencer data not found.');
  }

  const influencers = await Influencer.findById(users.influencer);
  const gender = influencers?.gender;
  if (!gender) {
    throw new Error('Gender information for the influencer is missing.');
  }

  const {
    searchTerm = '',
    name = '',
    page = 1,
    limit = 10,
    ...filterData
  } = query;
  const anyConditions: any[] = [
    { status: 'active' },
    { approvalStatus: 'Approved' },
    { $expr: { $ne: ['$influencerCount', '$collaborationLimit'] } },
  ];

  // Search by category name
  if (searchTerm) {
    const categoriesIds = await Category.find({
      categoryName: { $regex: searchTerm, $options: 'i' },
    }).distinct('_id');

    if (categoriesIds.length > 0) {
      anyConditions.push({ category: { $in: categoriesIds } });
    }
  }

  // Add gender filter logic
  if (gender === 'Male') {
    anyConditions.push({ gender: { $in: ['Male', 'All'] } });
  } else if (gender === 'Female') {
    anyConditions.push({ gender: { $in: ['Female', 'All'] } });
  } else if (gender === 'Other') {
    anyConditions.push({ gender: { $in: ['Other', 'All'] } });
  }

  // Search by campaign name
  if (name) {
    anyConditions.push({ name: { $regex: name, $options: 'i' } });
  }

  // Filter additional fields
  Object.entries(filterData).forEach(([field, value]) => {
    anyConditions.push({ [field]: value });
  });

  // Filter by endTime
  const dateFilter = buildDateFilter(filterData.endTime as string);
  if (dateFilter) {
    anyConditions.push(dateFilter);
  }

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const skip = (Number(page) - 1) * Number(limit);

  // Fetch campaigns
  const result = await Campaign.find(whereConditions)
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
    .limit(Number(limit))
    .lean();

  const count = await Campaign.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: Number(page),
      total: count,
    },
  };
};

export const CampaignService = {
  createCampaignToDB,
  getAllCampaigns,
  getSingleCmpaign,
  updateCampaignToDB,
  deletedCampaignToDB,
  getCampaignforBrand,
  getAllCampaignsForAdmin,
  getAllCampaignForInfluencer,
  getCampaignforAllData,
};
