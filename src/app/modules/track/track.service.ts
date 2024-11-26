import { populate } from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Track } from './track.model';
import { ITrack } from './track.interface';
import mongoose from 'mongoose';
import { ShowInterest } from '../showInterest/showInterest.model';

const getAllTracks = async (
  influencerId: string,
  query: Record<string, unknown>
) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  if (searchTerm) {
    anyConditions.push({
      $or: [{ status: { $regex: searchTerm, $options: 'i' } }],
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  anyConditions.push({ influencer: influencerId });

  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  anyConditions.push({ completeStatus: { $ne: 'Completed' } });

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch DiscountClub data
  const result = await Track.find(whereConditions)
    .populate({
      path: 'campaign',
      // select: 'user image name',
      populate: {
        path: 'user',
        select: 'brand fullName',
        populate: {
          path: 'brand',
          select: 'image name owner',
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

const getAllTrackForBrand = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  if (searchTerm) {
    anyConditions.push({
      $or: [{ status: { $regex: searchTerm, $options: 'i' } }],
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  anyConditions.push({ campaign: userId });

  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch DiscountClub data
  const result = await Track.find(whereConditions)
    .populate({
      path: 'influencer',
      select: 'fullName influencer',
      populate: {
        path: 'influencer',
      },
    })
    .populate({
      path: 'campaign',
      // select: 'user image name',
      populate: {
        path: 'user',
        select: 'brand fullName',
        populate: {
          path: 'brand',
          select: 'image owner name',
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
