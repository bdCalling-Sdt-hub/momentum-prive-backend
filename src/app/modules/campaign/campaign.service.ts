import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { CampaignSearchAbleFields } from './campaign.contant';
import { ICampaign, IICampaignFilters } from './campaign.interface';
import { Campaign } from './campaign.model';
import { Collaborate } from '../collaboration/collaboration.model';
import { IPaginationOptions } from '../../../types/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { SortOrder } from 'mongoose';
import { Brand } from '../brand/brand.model';
import { Category } from '../category/category.model';
import { User } from '../user/user.model';
import dayjs from 'dayjs';

// const createCampaignToDB = async (payload: Partial<ICampaign>) => {
//   // const isCategoryOfBrand = await Brand.findById(payload.brand);
//   const isCategoryOfBrand = await User.findById(payload.user);

//   console.log(isCategoryOfBrand);

//   if (
//     isCategoryOfBrand?.title === 'Silver' &&
//     isCategoryOfBrand.subscription === true
//   ) {
//   }
//   const isBrandOfCat = await Brand.findById(isCategoryOfBrand?.brand);

//   const isCategoryName = isBrandOfCat?.category;

//   const campaign = await Campaign.create({
//     ...payload,
//     category: isCategoryName,
//   });
//   return campaign;
// };

// Use dayjs to handle date calculations

const createCampaignToDB = async (payload: Partial<ICampaign>) => {
  const isCategoryOfBrand = await User.findById(payload.user);

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

  const isBrandOfCat = await Brand.findById(isCategoryOfBrand?.brand);
  const isCategoryName = isBrandOfCat?.category;

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
  const anyConditions: any[] = [{ status: 'active' }];

  if (searchTerm) {
    const categoriesIds = await Category.find({
      $or: [{ categoryName: { $regex: searchTerm, $options: 'i' } }],
    }).distinct('_id');

    // Only add `catogory` condition if there are matching users
    if (categoriesIds.length > 0) {
      anyConditions.push({ category: { $in: categoriesIds } });
    }
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({
        [field]: value,
      })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Apply filter conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await Campaign.find(whereConditions)
    .populate({
      path: 'category',
      select: 'categoryName',
    })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Campaign.countDocuments(whereConditions);

  const data: any = {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
  return data;
};

// const getAllCampaigns = async (
//   filters: IICampaignFilters,
//   paginationOptions: IPaginationOptions
// ) => {
//   const { searchTerm, ...filtersData } = filters;
//   const { page, limit, skip, sortBy, sortOrder } =
//     paginationHelpers.calculatePagination(paginationOptions);

//   const andConditions = [];

//   if (searchTerm) {
//     andConditions.push({
//       $or: CampaignSearchAbleFields.map(field => ({
//         [field]: {
//           $regex: searchTerm,
//           $options: 'i',
//         },
//       })),
//     });
//   }

//   if (Object.keys(filtersData).length) {
//     andConditions.push({
//       $and: Object.entries(filtersData).map(([field, value]) => ({
//         [field]: value,
//       })),
//     });
//   }

//   andConditions.push({
//     status: 'active',
//   });

//   const sortConditions: { [key: string]: SortOrder } = {};

//   if (sortBy && sortOrder) {
//     sortConditions[sortBy] = sortOrder;
//   }

//   const whereConditions =
//     andConditions.length > 0 ? { $and: andConditions } : {};

//   const result = await Campaign.find(whereConditions)
//     .populate({
//       path: 'user',
//       populate: {
//         path: 'brand',
//       },
//     })
//     .populate(['influencer', 'category'])
//     .sort(sortConditions)
//     .skip(skip)
//     .limit(limit);

//   const total = await Campaign.countDocuments();
//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: result,
//   };
// };

const getSingleCmpaign = async (id: string) => {
  const result = await Campaign.findOne({ _id: id, status: 'active' })
    .populate({
      path: 'user',
      populate: {
        path: 'brand',
      },
    })
    .populate(['influencer', 'category']);

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

export const CampaignService = {
  createCampaignToDB,
  getAllCampaigns,
  getSingleCmpaign,
  updateCampaignToDB,
  deletedCampaignToDB,
  updatedCampaignStatusToDB,
};
