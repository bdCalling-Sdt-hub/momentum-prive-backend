import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Campaign } from '../campaign/campaign.model';
import { Category } from '../category/category.model';
import { InterestInfluencer } from '../interest/interest.model';
import { ISubmitProve } from './submitProve.interface';
import { SubmitProve } from './submitProve.model';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Track } from '../track/track.model';
import { Types } from 'mongoose';
import { populate } from 'dotenv';

const submitProveToDB = async (payload: ISubmitProve) => {
  const trackId = payload.track;

  const trackStatus = await Track.findById(trackId);

  // if (trackStatus?.status !== 'Accepted') {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, 'Track is not Accepted yet');
  // }

  const isTrack = await Track.findById(trackId);

  const isCampaign = await Campaign.findById(isTrack?.campaign);

  const isInfluencer = await User.findById(isTrack?.influencer);

  const isCategory = await Category.findById(isCampaign?.category);

  const category = isCategory?.categoryName;

  const value = {
    categoryName: category,
    ...payload,
  };

  const result = await SubmitProve.create(value);

  const createInterestInfluencer = await InterestInfluencer.create({
    campaign: isCampaign,
    influencer: isInfluencer,
    submitProve: result._id,
    track: payload.track,
  });

  if (!createInterestInfluencer) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create interestInfluencer with SubmitProve details'
    );
  }

  if (result) {
    const data = {
      text: ` accepted your invitation`,
      receiver: isCampaign?.user,
    };

    await sendNotifications(data);

    const bookingData = {
      text: `${isInfluencer?.fullName} Submit new Prove`,
      receiver: isCampaign?.user,
      type: 'ADMIN',
    };

    await sendNotifications(bookingData);
  }
  return result;
};

const getAllSubmitProve = async (influencerId: string) => {
  const influencerTracks = await Track.find({
    influencer: new Types.ObjectId(influencerId),
  });

  const trackIds = influencerTracks.map(track => track._id);

  const result = await SubmitProve.find({ track: { $in: trackIds } }).populate({
    path: 'track',
    select: 'campaign',
    populate: {
      path: 'campaign',
      populate: {
        path: 'user',
        select: 'brand',
        populate: {
          path: 'brand',
          select: 'image owner',
        },
      },
    },
  });

  return result;
};
const getAllSubmitProveForBrand = async (userId: string) => {
  // Find the campaigns associated with the user's brand
  const influencerTracks = await Track.find({
    brand: new Types.ObjectId(userId),
  });

  const trackIds = influencerTracks.map(track => track._id);

  // Fetch SubmitProve data filtered by trackIds and populate necessary fields
  const result = await SubmitProve.find({ track: { $in: trackIds } }).populate({
    path: 'track',
    select: 'campaign',
    populate: {
      path: 'campaign',
      populate: {
        path: 'user',
        select: 'brand',
        populate: {
          path: 'brand',
          select: 'image owner',
        },
      },
    },
  });

  return result;
};

export const SubmitProveService = {
  submitProveToDB,
  getAllSubmitProve,
  getAllSubmitProveForBrand,
};

// .populate({
//   path: 'campaign',
//   select: 'user image name',
//   populate: {
//     path: 'user',
//     select: 'brand',
//     populate: {
//       path: 'brand',
//       select: 'image owner',
//     },
//   },
// });
