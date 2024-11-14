import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Track } from './track.model';
import { ITrack } from './track.interface';
import mongoose from 'mongoose';
import { ShowInterest } from '../showInterest/showInterest.model';

// const getAllTracks = async (influencerId: string) => {
//   const result = await Track.find({ influencer: influencerId }).populate({
//     path: 'campaign',
//     select: 'user image name',
//     populate: {
//       path: 'user',
//       select: 'brand',
//       populate: {
//         path: 'brand',
//         select: 'image owner',
//       },
//     },
//   });

//   if (!result) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Track not found');
//   }

//   return result;
// };

const getAllTracks = async (
  influencerId: string,
  query: Record<string, unknown>
) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  anyConditions.push({ influencer: influencerId });

  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch DiscountClub data
  const result = await Track.find(whereConditions)
    .populate({
      path: 'campaign',
      select: 'user image name',
      populate: {
        path: 'user',
        select: 'brand',
        populate: {
          path: 'brand',
          select: 'image owner',
        },
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Track.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

// const getAllTrackForBrand = async (userId: string | undefined) => {
//   if (!userId) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'UserId is required');
//   }

//   const allResults = await Track.find({})
//     .populate('influencer', 'fullName')
//     .populate({
//       path: 'campaign',
//       select: 'user image name',
//       populate: {
//         path: 'user',
//         select: 'brand',
//         populate: {
//           path: 'brand',
//           select: 'image owner',
//         },
//       },
//     });

//   const filteredResult = allResults.filter(
//     (item: any) => item.campaign && item.campaign.user._id.toString() === userId
//   );

//   if (filteredResult.length === 0) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
//   }

//   const count = filteredResult.length;
//   if (!count) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
//   }

//   return { result: filteredResult, count };
// };

const getAllTrackForBrand = async (
  userId: string | undefined,
  page: number = 1, // Default to page 1 if not provided
  limit: number = 10 // Default to limit 10 if not provided
) => {
  if (!userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'UserId is required');
  }

  // Calculate skip and limit
  const skip = (page - 1) * limit;

  const allResults = await Track.find({})
    .skip(skip) // Skip records for pagination
    .limit(limit) // Limit the number of records per page
    .populate('influencer', 'fullName')
    .populate({
      path: 'campaign',
      select: 'user image name',
      populate: {
        path: 'user',
        select: 'brand',
        populate: {
          path: 'brand',
          select: 'image owner',
        },
      },
    });

  // Filter the results based on the userId
  const filteredResult = allResults.filter(
    (item: any) => item.campaign && item.campaign.user._id.toString() === userId
  );

  if (filteredResult.length === 0) {
    return { result: [], count: 0 };
  }

  // Get the total count of matching items for pagination info
  const count = filteredResult.length;

  return { result: filteredResult, count };
};

// const getAllTrackForBrand = async (userId: string | undefined) => {
//   const filter: any = {};

//   const result = await Track.find(filter)
//     .populate('influencer', 'fullName')
//     .populate({
//       path: 'campaign',
//       select: 'user image name',
//       populate: {
//         path: 'user',
//         select: 'brand',
//         populate: {
//           path: 'brand',
//           select: 'image owner',
//         },
//       },
//     });

//   const filteredResult = result.filter(
//     (item: any) => item.campaign && item.campaign.user.toString() === userId
//   );

//   const count = filteredResult.length;

//   if (!filteredResult.length) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
//   }

//   return { result: filteredResult, count };
// };

const updateTrackStatus = async (id: string, payload: Partial<ITrack>) => {
  const result = await Track.findByIdAndUpdate(
    id,
    {
      status: payload.status,
      new: true,
      runValidators: true,
    },
    { new: true }
  );

  const influencerId = result?.influencer;

  const updateTrackStatus = await ShowInterest.findOneAndUpdate(
    { influencer: influencerId },
    { status: payload.status },
    { new: true }
  );

  console.log(updateTrackStatus);

  if (!updateTrackStatus) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
  }

  return result;
};

export const TrackService = {
  getAllTracks,
  updateTrackStatus,
  getAllTrackForBrand,
};
