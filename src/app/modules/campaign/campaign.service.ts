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

const createCampaignToDB = async (payload: Partial<ICampaign>) => {
  const isCategoryOfBrand = await Brand.findById(payload.brand);
  const isCategoryName = isCategoryOfBrand?.category;

  const fineCategory = await Category.findOne({ _id: isCategoryName });

  const campaign = await Campaign.create({
    ...payload,
    category: isCategoryName,
    categoryName: fineCategory?.categoryName,
  });
  return campaign;
};

const getAllCampaigns = async (
  filters: IICampaignFilters,
  paginationOptions: IPaginationOptions
) => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: CampaignSearchAbleFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  andConditions.push({
    status: 'active',
  });

  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Campaign.find(whereConditions)
    .populate(['brand', 'influencer', 'category'])

    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Campaign.countDocuments();
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// const getAllCampaigns = async (
//   filters: IICampaignFilters,
//   paginationOptions: IPaginationOptions
// ) => {
//   const { searchTerm, ...filtersData } = filters;
//   const { page, limit, skip, sortBy, sortOrder } =
//     paginationHelpers.calculatePagination(paginationOptions);

//   const andConditions: any[] = [];

//   // Base conditions for active status
//   const baseConditions = {
//     status: 'active',
//   };

//   // Search term conditions - only apply if searchTerm is present
//   if (searchTerm) {
//     andConditions.push({
//       $or: [
//         ...CampaignSearchAbleFields.map(field => ({
//           [field]: {
//             $regex: searchTerm,
//             $options: 'i',
//           },
//         })),
//         { 'category.categoryName': { $regex: searchTerm, $options: 'i' } },
//         { 'brand.country': { $regex: searchTerm, $options: 'i' } },
//         { 'brand.city': { $regex: searchTerm, $options: 'i' } },
//         { 'brand.brandName': { $regex: searchTerm, $options: 'i' } },
//       ],
//     });
//   }

//   console.log(searchTerm);

//   // Filtering conditions from filterData
//   if (Object.keys(filtersData).length) {
//     andConditions.push({
//       $and: Object.entries(filtersData).map(([field, value]) => {
//         if (typeof value === 'string') {
//           return {
//             [field]: {
//               $regex: value,
//               $options: 'i',
//             },
//           };
//         } else {
//           return { [field]: value };
//         }
//       }),
//     });
//   }

//   // Combine base conditions and search/filter conditions
//   const finalMatchConditions = {
//     $and: [baseConditions, ...(andConditions.length > 0 ? andConditions : [])],
//   };

//   // Define sort conditions
//   const sortConditions: Record<string, 1 | -1> = {};
//   if (sortBy && sortOrder) {
//     sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1; // Ensure values are either 1 or -1
//   }

//   try {
//     // Use aggregate to perform lookup and search on category.name
//     const result = await Campaign.aggregate([
//       {
//         $match: finalMatchConditions,
//       },
//       {
//         $lookup: {
//           from: 'brands',
//           localField: 'brand',
//           foreignField: '_id',
//           as: 'brand',
//         },
//       },
//       {
//         $unwind: '$brand',
//       },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'category',
//           foreignField: '_id',
//           as: 'category',
//         },
//       },
//       {
//         $unwind: '$category',
//       },
//       {
//         $lookup: {
//           from: 'influencers',
//           localField: 'influencer',
//           foreignField: '_id',
//           as: 'influencer',
//         },
//       },
//       {
//         $unwind: '$influencer',
//       },
//       {
//         $sort: sortConditions,
//       },
//       {
//         $skip: skip,
//       },
//       {
//         $limit: limit,
//       },
//     ]);

//     console.log({ result });

//     // Count total documents matching the final match conditions
//     const total = await Campaign.countDocuments(finalMatchConditions);

//     // Debugging output

//     return {
//       meta: {
//         page,
//         limit,
//         total,
//       },
//       data: result,
//     };
//   } catch (error) {
//     throw new Error('Failed to fetch campaigns');
//   }
// };

const getSingleCmpaign = async (id: string) => {
  const result = await Campaign.findOne({ _id: id, status: 'active' }).populate(
    ['brand', 'influencer', 'category']
  );

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
