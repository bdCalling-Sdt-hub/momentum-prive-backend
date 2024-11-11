import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IReview } from './review.interface';
import { Review } from './review.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { reviewSearchAbleFields } from './review.constant';

const createReviewToDB = async (payload: Partial<IReview>) => {
  const result = await Review.create(payload);
  return result;
};

const getAllReview = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [{ status: 'active' }];

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
  const result = await Review.find(whereConditions)
    .populate({
      path: 'brand',
      select: 'brand',
      populate: {
        path: 'brand',
        select: 'image owner',
      },
    })
    .populate({
      path: 'influencer',
      select: 'influencer',
      populate: {
        path: 'influencer',
        select: 'fullName image',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Review.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

// const getAllReview = async (query: Record<string, unknown>) => {
//   const reviewBuilder = new QueryBuilder(
//     Review.find()
//       .populate({
//         path: 'brand',
//         populate: {
//           path: 'brand',
//         },
//       })
//       .populate({
//         path: 'influencer',
//         populate: {
//           path: 'influencer',
//         },
//       }),
//     query
//   )
//     .search(reviewSearchAbleFields)
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await reviewBuilder.modelQuery;

//   return result;
// };

const getSingleReview = async (id: string) => {
  const result = await Review.findOne({ _id: id, status: 'active' })
    .populate({
      path: 'brand',
      populate: {
        path: 'brand',
      },
    })
    .populate({
      path: 'influencer',
      populate: {
        path: 'influencer',
      },
    });

  if (!result?.brand || !result?.influencer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  if (!result === null) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  return result;
};

const updateReviewToDB = async (id: string, payload: Partial<IReview>) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  if (review.status !== 'active') {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Review is not active, cannot be updated'
    );
  }

  const result = await Review.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteReviewToDB = async (id: string) => {
  const result = await Review.findByIdAndDelete(id, {
    status: 'delete',
    new: true,
    runValidators: true,
  });
  return result;
};

export const ReviewService = {
  createReviewToDB,
  getAllReview,
  getSingleReview,
  updateReviewToDB,
  deleteReviewToDB,
};
