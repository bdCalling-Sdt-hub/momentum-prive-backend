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
  const reviewBuilder = new QueryBuilder(
    Review.find().populate(['brand', 'influencer']),
    query
  )
    .search(reviewSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reviewBuilder.modelQuery;

  return result;
};

const getSingleReview = async (id: string) => {
  const result = await Review.findOne({ _id: id, status: 'active' }).populate([
    'brand',
    'influencer',
  ]);

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
  const result = await Review.findByIdAndUpdate(id, {
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
