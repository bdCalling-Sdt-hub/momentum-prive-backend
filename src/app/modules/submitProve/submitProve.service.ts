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

// const submitProveToDB = async (payload: ISubmitProve) => {
//   const trackId = payload.track;

//   const trackStatus = await Track.findById(trackId);

//   if (trackStatus?.status !== 'Accepted') {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Track is not Accepted yet');
//   }

//   const isExistSubmitProve = await SubmitProve.findOne({
//     track: trackId,
//   });

//   if (isExistSubmitProve) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'You have already submitted prove for this track'
//     );
//   }

//   const isTrack = await Track.findById(trackId);

//   const isCampaign = await Campaign.findById(isTrack?.campaign);

//   const isInfluencer = await User.findById(isTrack?.influencer);

//   const isCategory = await Category.findById(isCampaign?.category);

//   const category = isCategory?.categoryName;

//   const value = {
//     categoryName: category,
//     ...payload,
//   };

//   const result = await SubmitProve.create(value);

//   const createInterestInfluencer = await InterestInfluencer.create({
//     campaign: isCampaign,
//     influencer: isInfluencer,
//     submitProve: result._id,
//     track: payload.track,
//   });

//   if (!createInterestInfluencer) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Failed to create interestInfluencer with SubmitProve details'
//     );
//   }

//   if (result) {
//     const data = {
//       text: ` accepted your invitation`,
//       receiver: isCampaign?.user,
//     };

//     await sendNotifications(data);

//     const bookingData = {
//       text: `${isInfluencer?.fullName} Submit new Prove`,
//       receiver: isCampaign?.user,
//       type: 'ADMIN',
//     };

//     await sendNotifications(bookingData);
//   }
//   return result;
// };

const submitProveToDB = async (payload: ISubmitProve) => {
  const { track: trackId } = payload;

  // Fetch track details and validate status
  const track = await Track.findById(trackId);
  if (!track || track.status !== 'Accepted') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Track is not Accepted yet');
  }

  // Check if a submission already exists for the track
  const isExistSubmitProve = await SubmitProve.findOne({ track: trackId });
  if (isExistSubmitProve) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You have already submitted prove for this track'
    );
  }

  // Fetch required data concurrently
  const [campaign, influencer, category] = await Promise.all([
    Campaign.findById(track.campaign),
    User.findById(track.influencer),
    track.campaign ? Category.findById(track.campaign) : null,
  ]);

  const categoryName = category?.categoryName;

  // Create the SubmitProve document
  const submitProveData = { categoryName, ...payload };
  const result = await SubmitProve.create(submitProveData);

  // Create InterestInfluencer document
  const interestInfluencerData = {
    campaign,
    influencer,
    submitProve: result._id,
    track: trackId,
  };

  const [createInterestInfluencer] = await Promise.all([
    InterestInfluencer.create(interestInfluencerData),
    sendNotifications({
      text: `accepted your invitation`,
      receiver: campaign?.user,
    }),
    sendNotifications({
      text: `${influencer?.fullName} Submit new Prove`,
      receiver: campaign?.user,
      type: 'ADMIN',
    }),
  ]);

  if (!createInterestInfluencer) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create interestInfluencer with SubmitProve details'
    );
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
