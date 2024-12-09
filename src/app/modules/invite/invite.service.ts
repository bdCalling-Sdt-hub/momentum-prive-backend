import { sendNotifications } from '../../../helpers/notificationHelper';
import { Brand } from '../brand/brand.model';
import { Campaign } from '../campaign/campaign.model';
import { IInvite } from './invite.interface';
import { Invite } from './invite.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Category } from '../category/category.model';
import { User } from '../user/user.model';
import dayjs from 'dayjs';
import { Influencer } from '../influencer/influencer.model';
import { Track } from '../track/track.model';

const createInviteToDB = async (payload: Partial<IInvite>) => {
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

  const isExist = await Invite.findOne({
    influencer: payload.influencer,
    campaign: payload.campaign,
  });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Influencer already invited');
  }

  const isUser: any = await User.findById(isUsers);

  const isBrnad = await Brand.findById(isUser?.brand);

  const isBrnadImage = isBrnad?.image;
  const isBrnadName = isUser?.fullName;

  if (!isUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // // payload.user = isUser._id;

  if (approveStatus === 'Rejected') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Sorry, your campaign was rejected. You cannot invite new influencers.'
    );
  }

  if (approveStatus !== 'Approved') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Campaign not approved yet. Please wait for approval.'
    );
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

  const result = await Invite.create(payload);

  // Send notification
  const data = {
    text: `Invited you to join for campaign`,
    receiver: payload.influencer,
    name: isBrnadName,
    image: isBrnadImage,
  };
  await sendNotifications(data);

  return result;
};

const inviteForSpasificInfluencer = async (payload: Partial<IInvite>) => {
  const { campaign, gender, country, city } = payload;

  // Validate required fields
  if (!campaign || !gender || !country || !city) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'All required fields (campaign, gender, country, city) must be provided.'
    );
  }

  // Fetch the campaign once
  const isCampaignStatus = await Campaign.findOne({ _id: campaign }).select(
    'approvalStatus user'
  );
  if (!isCampaignStatus) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  const { approvalStatus, user } = isCampaignStatus;

  // Handle campaign status validation
  if (approvalStatus === 'Rejected') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Sorry, your campaign was rejected. You cannot invite new influencers.'
    );
  }

  if (approvalStatus !== 'Approved') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Campaign not approved yet. Please wait for approval.'
    );
  }

  // Find influencers matching criteria in one query
  const influencers = await Influencer.find({ gender, country, city }).select(
    '_id'
  );
  if (!influencers.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No influencers found');
  }

  // Fetch user data, including brand information
  const userData = await User.findById(user).select('fullName brand');
  if (!userData) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Fetch brand image if a brand is associated
  let brandImage = null;
  if (userData.brand) {
    const brandData = await Brand.findById(userData.brand).select('image');
    brandImage = brandData?.image;
  }

  // Create bulk invites
  const invitePayloads = influencers?.map(influencer => ({
    campaign,
    influencer: influencer._id,
  }));

  const invites = await Invite.insertMany(invitePayloads);

  // Send notifications for all influencers in parallel
  const notificationPromises = influencers.map(influencer => {
    const notificationData = {
      text: `You have been invited to join the campaign.`,
      receiver: influencer._id,
      name: userData?.fullName,
      image: brandImage,
    };
    return sendNotifications(notificationData);
  });

  await Promise.all(notificationPromises);

  return {
    message: 'Invitations sent successfully',
    totalInvited: invites.length,
    invites,
  };
};

const getAllInvites = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  // Step 1: Search for campaigns by category name
  if (searchTerm) {
    const campaignIds = await Campaign.find({
      category: {
        $in: await Category.find({
          categoryName: { $regex: searchTerm, $options: 'i' },
        }).distinct('_id'),
      },
    }).distinct('_id');

    if (campaignIds.length > 0) {
      anyConditions.push({ campaign: { $in: campaignIds } });
    }
  }

  // Step 2: Include other filter data
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({
        [field]: value,
      })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Apply filter conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await Invite.find(whereConditions)
    .populate({
      path: 'campaign',
      // select: 'image name startTime endTime category',
      populate: {
        path: 'category',
        select: 'categoryName',
      },
    })
    .populate({
      path: 'campaign',
      select: 'image name startTime endTime category',
      populate: {
        path: 'user',
        select: 'fullName',
        populate: {
          path: 'brand',
          select: 'owner image',
        },
      },
    })
    .populate({
      path: 'influencer',
      select: 'fullName',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Invite.countDocuments(whereConditions);

  const data: any = {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
  return data;
};

const getAllInvitesForInfluencer = async (query: Record<string, unknown>) => {
  const { searchTerm, page, influencerId, limit, ...filterData } = query;
  const anyConditions: any[] = [];

  // Step 1: Search for campaigns by category name
  if (searchTerm) {
    const campaignIds = await Campaign.find({
      category: {
        $in: await Category.find({
          categoryName: { $regex: searchTerm, $options: 'i' },
        }).distinct('_id'),
      },
    }).distinct('_id');

    if (campaignIds.length > 0) {
      anyConditions.push({ campaign: { $in: campaignIds } });
    }

    // Add search for status (Cancel, Accepted, Pending, etc.)
    anyConditions.push({
      $or: [
        { status: { $regex: searchTerm, $options: 'i' } }, // Match status field
        {
          'campaign.category.categoryName': {
            $regex: searchTerm,
            $options: 'i',
          },
        }, // Match category name
      ],
    });
  }

  // Step 2: Include influencerId in the conditions
  anyConditions.push({ influencer: influencerId });

  // Step 3: Include other filter data
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({
        [field]: value,
      })
    );
    anyConditions.push({ $and: filterConditions });
  }

  anyConditions.push({ completeStatus: { $ne: 'Completed' } });

  // Apply filter conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch invites based on the conditions
  const result = await Invite.find(whereConditions)
    .populate({
      path: 'campaign',
      populate: {
        path: 'category',
        select: 'categoryName',
      },
    })
    .populate({
      path: 'campaign',
      select: 'image name startTime endTime category',
      populate: {
        path: 'user',
        select: 'fullName',
        populate: {
          path: 'brand',
          select: 'owner image',
        },
      },
    })
    .populate({
      path: 'influencer',
      select: 'fullName',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  // Get the count of documents matching the conditions
  const count = await Invite.countDocuments(whereConditions);

  const data: any = {
    result,
    meta: {
      page: pages,
      limit: size,
      total: count,
    },
  };
  return data;
};

const getSingleInvite = async (id: string) => {
  const result = await Invite.findById(id)

    .populate({
      path: 'campaign',

      populate: {
        path: 'category',
        select: 'categoryName',
      },
    })
    .populate({
      path: 'campaign',

      populate: {
        path: 'user',
        select: 'fullName',
        populate: {
          path: 'brand',
        },
      },
    })
    .populate({
      path: 'influencer',
      select: 'fullName',
    });

  if (!result) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invite not found');
  }

  return result;
};

const updatedInviteToDB = async (id: string, payload: Partial<IInvite>) => {
  const invite = await Invite.findById(id);

  if (!invite) {
    throw new Error(`Invite with ID ${id} not found`);
  }

  const updatedStatus = payload.status === 'Accepted' ? 'Accepted' : 'Cancel';

  const result = await Invite.findByIdAndUpdate(
    id,
    {
      $set: {
        status: updatedStatus,
      },
    },
    { new: true }
  );

  return result;
};

const createInviteForIncluencerToDB = async (payload: Partial<IInvite>) => {
  const isExistInfluencer = await Invite.findOne({
    influencer: payload.influencer,
  });

  if (isExistInfluencer) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Influencer already invited');
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

  // payload.user = isUser._id;

  if (isUser.title === 'Silver' && isUser.subscription === true) {
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();

    const userInvitationCount = await Invite.countDocuments({
      campaign: payload.campaign,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (userInvitationCount >= 2) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'sorry you cannot send invite the campaign limit is full!'
      );
    }
  }

  if (approveStatus === 'Rejected') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Sorry, your campaign was rejected. You cannot invite new brand.'
    );
  }

  if (approveStatus !== 'Approved') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Campaign not approved yet. Please wait for approval.'
    );
  }

  // Check if the campaign has reached its monthly invite limit
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();

  const campaignInviteCount = await Invite.countDocuments({
    campaign: payload.campaign,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  const isTrack = await Track.create({
    user: isUser._id,
    campaign: payload.campaign,
  });

  if (!isTrack) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Track not found');
  }

  if (campaignInviteCount >= 2) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Each campaign can only create up to 2 invites per month.'
    );
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

  const result = await Invite.create(payload);

  const CampaignInviteCount = await Invite.countDocuments({
    campaign: payload.campaign,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  // Send notification
  const data = {
    text: `${fullName} invited you to join for events`,
    receiver: payload.influencer,
  };
  await sendNotifications(data);

  return { result, CampaignInviteCount };
};

const getAllInvitesForBrand = async (
  campaignId: string,
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

  anyConditions.push({ campaign: campaignId });

  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch DiscountClub data
  const result = await Invite.find(whereConditions)
    .populate({
      path: 'influencer',
      select: 'fullName influencer',
      populate: {
        path: 'influencer',
        select: 'image',
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

  const count = await Invite.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

export const InviteService = {
  createInviteToDB,
  getAllInvites,
  updatedInviteToDB,
  getSingleInvite,
  createInviteForIncluencerToDB,
  getAllInvitesForInfluencer,
  inviteForSpasificInfluencer,
  getAllInvitesForBrand,
};
