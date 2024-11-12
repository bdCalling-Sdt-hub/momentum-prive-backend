import { populate } from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { CampaignSearchAbleFields } from './campaign.contant';
import { ICampaign, IICampaignFilters } from './campaign.interface';
import { Campaign } from './campaign.model';
import { Collaborate } from '../collaboration/collaboration.model';
import { IPaginationOptions } from '../../../types/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { SortOrder, Types } from 'mongoose';
import { Brand } from '../brand/brand.model';
import { Category } from '../category/category.model';
import { User } from '../user/user.model';
import dayjs from 'dayjs';
import { formatCurrentDate } from './dateformat';

// const createCampaignToDB = async (payload: Partial<ICampaign>) => {
//   const isCategoryOfBrand = await User.findById(payload.user);

//   // Check if the user has the "Silver" title and an active subscription
//   if (
//     isCategoryOfBrand?.title === 'Silver' &&
//     isCategoryOfBrand.subscription === true
//   ) {
//     // Calculate the start and end dates for the current month
//     const startOfMonth = dayjs().startOf('month').toDate();
//     const endOfMonth = dayjs().endOf('month').toDate();

//     // Count campaigns created by the user within the current month
//     const monthlyCampaignCount = await Campaign.countDocuments({
//       user: payload.user,
//       createdAt: { $gte: startOfMonth, $lte: endOfMonth },
//     });

//     if (monthlyCampaignCount >= 10) {
//       throw new ApiError(
//         StatusCodes.UNAUTHORIZED,
//         'Silver users can only create up to 10 campaigns per month.'
//       );
//     }
//   }

//   if (
//     isCategoryOfBrand?.title === 'Silver' &&
//     isCategoryOfBrand.subscription === true
//   ) {
//     if (payload.collaborationLimit && payload.collaborationLimit > 2) {
//       throw new ApiError(
//         StatusCodes.UNAUTHORIZED,
//         'Silver users can only set a collaboration limit of up to 2.'
//       );
//     }
//   }

//   const isBrandOfCat = await Brand.findById(isCategoryOfBrand?.brand);
//   const isCategoryName = isBrandOfCat?.category;

//   // Create the campaign with the associated category
//   const campaign = await Campaign.create({
//     ...payload,
//     category: isCategoryName,
//   });

//   // Get the updated count of campaigns after the new creation
//   const startOfMonth = dayjs().startOf('month').toDate();
//   const endOfMonth = dayjs().endOf('month').toDate();
//   const CampaignsCount = await Campaign.countDocuments({
//     user: payload.user,
//     createdAt: { $gte: startOfMonth, $lte: endOfMonth },
//   });

//   return { campaign, CampaignsCount };
// };

const createCampaignToDB = async (payload: Partial<ICampaign>) => {
  const isCategoryOfBrand = await User.findById(payload.user);

  // Convert collaborationLimit to a number, with a default value of 0 if undefined or invalid
  const collaborationLimit = Number(payload.collaborationLimit) || 0;

  // Check if the user has the "Silver" title and an active subscription
  if (
    isCategoryOfBrand?.title === 'Silver' &&
    isCategoryOfBrand.subscription === true
  ) {
    // Calculate the start and end dates for the current month
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();

    // Count campaigns created by the user within the current month
    const monthlyCampaignCount = await Campaign.countDocuments({
      user: payload.user,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (monthlyCampaignCount >= 10) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Silver users can only create up to 10 campaigns per month.'
      );
    }
  }

  if (
    isCategoryOfBrand?.title === 'Silver' &&
    isCategoryOfBrand.subscription === true
  ) {
    if (collaborationLimit > 2) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Silver users can only set a collaboration limit of up to 2.'
      );
    }
  }

  const isBrandOfCat = await Brand.findById(isCategoryOfBrand?.brand);
  const isCategoryName = isBrandOfCat?.category;

  payload.collaborationLimit = collaborationLimit;

  // Create the campaign with the associated category
  const campaign = await Campaign.create({
    ...payload,
    category: isCategoryName,
  });

  // Get the updated count of campaigns after the new creation
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();
  const CampaignsCount = await Campaign.countDocuments({
    user: payload.user,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  return { campaign, CampaignsCount };
};

const getAllCampaigns = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
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

  // Filter by additional filterData fields
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Filter by `endTime` from current date to specified endTime
  if (filterData.endTime) {
    const specifiedEndTime = new Date(filterData.endTime as string);

    const endTimeFormatted = specifiedEndTime.toISOString().split('T')[0];

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentDateFormatted = currentDate.toISOString().split('T')[0];

    // Filter by `endTime` from current date to specified endTime
    anyConditions.push({
      endTime: { $gte: currentDateFormatted, $lte: endTimeFormatted },
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
  const result = await Campaign.findById(id, { status: 'active' })

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

  if (campaign.status !== 'active') {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Campaign is not active, cannot be updated'
    );
  }

  const result = await Campaign.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
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

const updatedCampaignStatusToDB = async (
  id: string,
  payload: Partial<ICampaign>
) => {
  const campaign = await Campaign.findById(id);

  if (!campaign) {
    throw new Error(`Campaign with ID ${id} not found`);
  }

  // Check if the status is being set to "Accepted"
  if (payload.typeStatus === 'Accepted') {
    const collaborationStatus = await Collaborate.findOneAndUpdate(
      { campaign: campaign._id },
      { status: 'Completed' },
      { new: true }
    );

    if (!collaborationStatus) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Collaboration not found');
    }
  }

  // Update the campaign status (Accepted or Rejected)
  const result = await Campaign.findByIdAndUpdate(
    id,
    {
      $set: {
        typeStatus: payload.typeStatus,
      },
    },
    { new: true }
  );

  return result;
};

const getCampaignforBrand = async (brandId: string) => {
  const campaigns = await Campaign.find({
    user: brandId,
    status: 'active',
  }).populate('user', 'brand');

  const count = campaigns.length;

  return { campaigns, count };
};

export const CampaignService = {
  createCampaignToDB,
  getAllCampaigns,
  getSingleCmpaign,
  updateCampaignToDB,
  deletedCampaignToDB,
  updatedCampaignStatusToDB,
  getCampaignforBrand,
  getAllCampaignsForAdmin,
};
