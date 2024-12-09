import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Campaign } from '../campaign/campaign.model';
import { IShowInterest } from './showInterest.interface';
import { User } from '../user/user.model';
import dayjs from 'dayjs';
import { ShowInterest } from './showInterest.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Track } from '../track/track.model';
import { Influencer } from '../influencer/influencer.model';

const createInviteForIncluencerToDB = async (
  payload: Partial<IShowInterest>
) => {
  const { influencer, campaign } = payload;

  // Fetch the campaign and related user information
  const campaignData = await Campaign.findOne({ _id: campaign }).populate(
    'user',
    'fullName'
  );
  if (!campaignData)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');

  const { approvalStatus, user: campaignUser } = campaignData;
  if (!campaignUser)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No user associated with the campaign'
    );

  // Validate campaign approval status
  if (approvalStatus === 'Rejected') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Campaign was rejected. New invites cannot be created.'
    );
  } else if (approvalStatus !== 'Approved') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Campaign is not yet approved. Please wait for approval.'
    );
  }

  // Check if influencer already showed interest
  if (influencer) {
    const existingInterest = await ShowInterest.findOne({
      influencer,
      campaign,
    });
    if (existingInterest) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Influencer already showed interest in this campaign.'
      );
    }
  }

  // Fetch related influencer and brand details
  const [influencerUser, campaignUserDetails] = await Promise.all([
    User.findById(influencer),
    User.findById(campaignUser),
  ]);

  if (!influencerUser || !campaignUserDetails) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User or influencer not found');
  }

  const influencerProfile = await Influencer.findById(
    influencerUser.influencer
  );
  const influencerImage = influencerProfile?.image?.[0];

  // Create tracking record
  const trackingRecord = await Track.create({
    influencer,
    campaign,
    brand: campaignUserDetails._id,
  });

  if (!trackingRecord)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Failed to create tracking record'
    );

  // Create "show interest" record
  const result = await ShowInterest.create(payload);

  // Send notification
  const notificationData = {
    text: `Showed interest in your campaign`,
    receiver: campaignUser,
    image: influencerImage,
    name: influencerUser.fullName,
  };
  await sendNotifications(notificationData);

  return result;
};

const getAllShowInterest = async (influencerId: string) => {
  const result = await ShowInterest.find({ influencer: influencerId })
    .populate('influencer', 'fullName')
    .populate('campaign');

  const count = result.length;

  return { result, count };
};

const getAllShowInterestForBrand = async (userId: string | undefined) => {
  const filter: any = {};

  const result = await ShowInterest.find(filter)
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

const getOneShowInterest = async (id: string) => {
  const result = await ShowInterest.findById(id);
  return result;
};

const updateInterestStatus = async (id: string, payload: IShowInterest) => {
  const result = await ShowInterest.findByIdAndUpdate(
    id,
    { status: payload.status },
    { new: true }
  );

  return result;
};

export const ShowInterestService = {
  createInviteForIncluencerToDB,
  updateInterestStatus,
  getAllShowInterest,
  getAllShowInterestForBrand,
  getOneShowInterest,
};
