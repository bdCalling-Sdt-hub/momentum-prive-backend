import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Campaign } from '../campaign/campaign.model';
import { IShowInterest } from './showInterest.interface';
import { User } from '../user/user.model';
import dayjs from 'dayjs';
import { ShowInterest } from './showInterest.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Track } from '../track/track.model';

const createInviteForIncluencerToDB = async (
  payload: Partial<IShowInterest>
) => {
  // Check if the campaign has reached its monthly invite limit first
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();

  const campaignInviteCount = await ShowInterest.countDocuments({
    campaign: payload.campaign,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  if (campaignInviteCount >= 2) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Sorry, you cannot send invite. The campaign limit is full!'
    );
  }

  // Now check if the influencer has already shown interest
  const isExistInfluencer = await ShowInterest.findOne({
    influencer: payload.influencer,
    campaign: payload.campaign,
  });

  if (isExistInfluencer) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Influencer already showed interest'
    );
  }

  const isCampaignStatus = await Campaign.findOne({ _id: payload.campaign });

  if (!isCampaignStatus) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  const approveStatus = isCampaignStatus?.approvalStatus;
  const isUsers = isCampaignStatus?.user;

  if (!isUsers) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No user associated with the campaign'
    );
  }

  const isUser: any = await User.findById(isUsers);

  if (!isUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (isUser.title === 'Silver' && isUser.subscription === true) {
    const userInvitationCount = await ShowInterest.countDocuments({
      campaign: payload.campaign,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (userInvitationCount >= 2) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Sorry, you cannot send invite. The campaign limit is full!'
      );
    }
  }

  if (approveStatus === 'Rejected') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Sorry, your campaign was rejected. You cannot invite new brands.'
    );
  }

  if (approveStatus !== 'Approved') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Campaign not approved yet. Please wait for approval.'
    );
  }

  const isTrack = await Track.create({
    influencer: payload.influencer,
    campaign: payload.campaign,
  });

  if (!isTrack) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Track not found');
  }

  const isCampaign = await Campaign.findOne({ _id: payload.campaign }).populate(
    'user',
    'fullName'
  );

  if (!isCampaign || !isCampaign.user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign or user not found');
  }

  //@ts-ignore
  const fullName = isCampaign.user.fullName;

  const result = await ShowInterest.create(payload);

  const showInterestCount = await ShowInterest.countDocuments({
    campaign: payload.campaign,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  // Send notification
  const data = {
    text: `${fullName} show interested in your campaign "${isCampaign.name}"`,
    receiver: isUsers,
  };
  await sendNotifications(data);

  return { result, showInterestCount };
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
