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
import { Influencer } from '../influencer/influencer.model';

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
  // Fetch influencer image data
  const influencerImage = await Influencer.findById(
    influencer?.influencer
  ).lean();
  const firstImage = influencerImage?.image?.[0] || null;

  // Create the SubmitProve document
  const submitProveData = { categoryName, ...payload };
  const result = await SubmitProve.create(submitProveData);

  if (result?.typeStatus === 'Review') {
    await Track.findOneAndUpdate(
      { _id: payload.track },
      { completeStatus: 'Completed' },
      { new: true }
    );
  }

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
      text: `Accepted your invitation`,
      name: influencer?.fullName,
      receiver: campaign?.user,
      image: firstImage,
    }),
    sendNotifications({
      text: `${influencer?.fullName} booking a new service`,
      type: 'ADMIN',
      name: influencer?.fullName,
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

const getAllSubmitProve = async (influencerId: string, typeStatus?: string) => {
  const influencerTracks = await Track.find({
    influencer: new Types.ObjectId(influencerId),
  });

  const trackIds = influencerTracks.map(track => track._id);

  // Build the query with optional typeStatus filter
  const query: any = { track: { $in: trackIds } };
  if (typeStatus) {
    query.typeStatus = typeStatus; // Add typeStatus to the query if provided
  }

  // Fetch data with the built query
  const result = await SubmitProve.find(query).populate({
    path: 'track',
    select: 'campaign',
    populate: {
      path: 'campaign',
      populate: {
        path: 'user',
        select: 'brand',
        populate: {
          path: 'brand',
          select: 'image owner name',
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
          select: 'image owner name',
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
