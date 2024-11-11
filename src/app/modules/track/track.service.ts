import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Track } from './track.model';
import { ITrack } from './track.interface';

const getAllTracks = async (influencerId: string) => {
  const result = await Track.find({ influencer: influencerId }).populate(
    'campaign'
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Track not found');
  }

  return result;
};

const getAllTrackForBrand = async (userId: string | undefined) => {
  const filter: any = {};

  const result = await Track.find(filter)
    .populate('influencer', 'fullName')
    .populate('campaign');

  const filteredResult = result.filter(
    (item: any) => item.campaign && item.campaign.user.toString() === userId
  );

  const count = filteredResult.length;

  if (!filteredResult.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
  }

  return { result: filteredResult, count };
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

  return result;
};

export const TrackService = {
  getAllTracks,
  updateTrackStatus,
  getAllTrackForBrand,
};
