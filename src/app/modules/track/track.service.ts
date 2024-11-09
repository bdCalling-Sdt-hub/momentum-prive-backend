import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Track } from './track.model';
import { ITrack } from './track.interface';

const getAllTracks = async () => {
  const result = await Track.find();

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Track not found');
  }

  return result;
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
};
