import { IUser } from './../user/user.interface';
import { sendNotifications } from '../../../helpers/notificationHelper';
import QueryBuilder from '../../builder/QueryBuilder';
import { Brand } from '../brand/brand.model';
import { Campaign } from '../campaign/campaign.model';
import { IInfluencer } from '../influencer/influencer.interface';
import { IInvite } from './invite.interface';
import { Invite } from './invite.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Category } from '../category/category.model';
import { populate } from 'dotenv';
import { User } from '../user/user.model';
import dayjs from 'dayjs';
import { Influencer } from '../influencer/influencer.model';
import { Track } from '../track/track.model';
import mongoose from 'mongoose';

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
    text: `invited you to join for events`,
    receiver: payload.influencer,
    name: isBrnadName,
    image: isBrnadImage,
  };
  await sendNotifications(data);

  return result;
};

///

const inviteForSpasificInfluencer = async (payload: Partial<IInvite>) => {
  const { campaign, gender, country, city } = payload;

  // Validate required fields
  if (!campaign || !gender || !country || !city) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'All required fields (campaign, gender, country, city) must be provided.'
    );
  }

  // Fetch the campaign
  const isCampaignStatus = await Campaign.findOne({ _id: campaign });
  if (!isCampaignStatus) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  const approveStatus = isCampaignStatus.approvalStatus;

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

  // Find influencers matching criteria
  const influencers = await Influencer.find({
    gender,
    country,
    city,
  });

  if (!influencers || influencers.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No influencers found');
  }

  const isCampaign = await Campaign.findById(campaign);

  const users = await User.findById(isCampaign?.user);

  const isBrand = await Brand.findById(users?.brand);

  // Loop through matched influencers and send invites
  const invites = [];
  for (const influencer of influencers) {
    const invitePayload = {
      campaign,
      influencer: influencer._id,
    };

    const result = await Invite.create(invitePayload);

    // Send notification
    const notificationData = {
      text: `You have been invited to join the campaign.`,
      receiver: influencer._id,
      name: users?.fullName,
      image: isBrand?.image,
    };

    await sendNotifications(notificationData);
    invites.push(result);
  }

  return {
    message: 'Invitations sent successfully',
    totalInvited: invites.length,
    invites,
  };
};

////////////////////////////////////////////////////////////////

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
      total: count,
    },
  };
  return data;
};

// const getAllInvitesForBrand = async (query: Record<string, unknown>) => {
//   // Destructure query parameters
//   const { searchTerm, page, brandId, limit, user, ...filterData } = query;

//   // Pagination setup
//   const pages = parseInt(page as string, 10) || 1;
//   const size = parseInt(limit as string, 10) || 10;
//   const skip = (pages - 1) * size;

//   // Initialize the aggregation pipeline
//   const pipeline: any[] = [];

//   // Step 1: Lookup campaigns
//   pipeline.push({
//     $lookup: {
//       from: 'campaigns', // Collection name for Campaigns
//       localField: 'campaign',
//       foreignField: '_id',
//       as: 'campaign',
//     },
//   });

//   // Step 2: Unwind the campaign array
//   pipeline.push({ $unwind: '$campaign' });

//   // Step 3: Lookup categories for campaigns
//   pipeline.push({
//     $lookup: {
//       from: 'categories', // Collection name for Categories
//       localField: 'campaign.category',
//       foreignField: '_id',
//       as: 'campaign.category',
//     },
//   });

//   // Step 4: Unwind the category array (optional, preserve null/empty values)
//   pipeline.push({
//     $unwind: { path: '$campaign.category', preserveNullAndEmptyArrays: true },
//   });

//   // Step 5: Filter by brandId
//   if (brandId && mongoose.Types.ObjectId.isValid(brandId as string)) {
//     pipeline.push({
//       $match: {
//         'campaign.user': new mongoose.Types.ObjectId(brandId as string),
//       },
//     });
//   } else if (brandId) {
//     throw new Error('Invalid brandId provided');
//   }

//   // Step 6: Filter by user (if provided)
//   if (user && mongoose.Types.ObjectId.isValid(user as string)) {
//     pipeline.push({
//       $match: {
//         'campaign.user': new mongoose.Types.ObjectId(user as string),
//       },
//     });
//   } else if (user) {
//     throw new Error('Invalid user ID provided');
//   }

//   if (searchTerm) {
//     pipeline.push({
//       $match: {
//         $or: [{ status: { $regex: searchTerm, $options: 'i' } }],
//       },
//     });
//   }

//   // Step 8: Apply additional filters (if any)
//   if (Object.keys(filterData).length > 0) {
//     const additionalFilters = Object.entries(filterData).reduce(
//       (acc, [key, value]) => ({ ...acc, [key]: value }),
//       {}
//     );
//     pipeline.push({ $match: additionalFilters });
//   }

//   // Step 9: Sorting and pagination
//   pipeline.push({ $sort: { createdAt: -1 } });
//   pipeline.push({ $skip: skip });
//   pipeline.push({ $limit: size });

//   // Step 10: Execute the aggregation pipeline
//   const result = await Invite.aggregate(pipeline);

//   // Step 11: Count total documents (exclude pagination steps)
//   const countPipeline = pipeline.slice(0, -2); // Remove $skip and $limit
//   countPipeline.push({ $count: 'total' });
//   const countResult = await Invite.aggregate(countPipeline);
//   const total = countResult[0]?.total || 0;

//   // Return the results with metadata
//   return {
//     result,
//     meta: {
//       page: pages,
//       limit: size,
//       total,
//     },
//   };
// };

const getAllInvitesForBrand = async (query: Record<string, unknown>) => {
  // Destructure query parameters
  const { searchTerm, page, campaignId, limit, user, ...filterData } = query;

  // Pagination setup
  const pages = parseInt(page as string, 10) || 1;
  const size = parseInt(limit as string, 10) || 10;
  const skip = (pages - 1) * size;

  // Initialize the aggregation pipeline
  const pipeline: any[] = [];

  // Step 1: Lookup campaigns
  pipeline.push({
    $lookup: {
      from: 'campaigns', // Collection name for Campaigns
      localField: 'campaign',
      foreignField: '_id',
      as: 'campaign',
    },
  });

  // Step 2: Unwind the campaign array
  pipeline.push({ $unwind: '$campaign' });

  // Step 3: Lookup categories for campaigns
  pipeline.push({
    $lookup: {
      from: 'categories', // Collection name for Categories
      localField: 'campaign.category',
      foreignField: '_id',
      as: 'campaign.category',
    },
  });

  // Step 4: Unwind the category array (optional, preserve null/empty values)
  pipeline.push({
    $unwind: { path: '$campaign.category', preserveNullAndEmptyArrays: true },
  });

  // Step 5: Filter by campaignId
  if (campaignId && mongoose.Types.ObjectId.isValid(campaignId as string)) {
    pipeline.push({
      $match: {
        'campaign._id': new mongoose.Types.ObjectId(campaignId as string), // Match nested _id
      },
    });
  } else if (campaignId) {
    throw new Error('Invalid campaignId provided');
  }

  // Step 6: Filter by user (if provided)
  if (user && mongoose.Types.ObjectId.isValid(user as string)) {
    pipeline.push({
      $match: {
        'campaign.user': new mongoose.Types.ObjectId(user as string), // Match nested user
      },
    });
  } else if (user) {
    throw new Error('Invalid user ID provided');
  }

  // Step 7: Filter by searchTerm (if provided)
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [{ status: { $regex: searchTerm, $options: 'i' } }],
      },
    });
  }

  // Step 8: Apply additional filters (if any)
  if (Object.keys(filterData).length > 0) {
    const additionalFilters = Object.entries(filterData).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {}
    );
    pipeline.push({ $match: additionalFilters });
  }

  // Step 9: Sorting and pagination
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: size });

  // Step 10: Execute the aggregation pipeline
  const result = await Invite.aggregate(pipeline);

  // Step 11: Count total documents (exclude pagination steps)
  const countPipeline = pipeline.slice(0, -2); // Remove $skip and $limit
  countPipeline.push({ $count: 'total' });
  const countResult = await Invite.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Return the results with metadata
  return {
    result,
    meta: {
      page: pages,
      limit: size,
      total,
    },
  };
};

const getSingleInvite = async (id: string) => {
  const result = await Invite.findById(id)

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
      // select: 'image name startTime endTime category',
      populate: {
        path: 'user',
        select: 'fullName',
        populate: {
          path: 'brand',
          // select: 'owner image',
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

  // Check if the status is 'Accepted' and modify it to 'Accomplish'
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
