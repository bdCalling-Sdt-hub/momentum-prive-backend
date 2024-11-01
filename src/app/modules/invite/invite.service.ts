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

const createInviteToDB = async (payload: Partial<IInvite>) => {
  const isCampaignStatus = await Campaign.findOne({ _id: payload.campaign });

  const approveStatus = isCampaignStatus?.approvalStatus;

  if (approveStatus === 'Rejected') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Sorry, your Campaign was Rejected you cannot invite new Influencers'
    );
  }

  if (approveStatus !== 'Approved') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Campaign not approved yet, please wait for approval'
    );
  }

  const isCampaign = await Campaign.findOne({ _id: payload.campaign }).populate(
    'user',
    'fullName'
  );

  // Check if the campaign exists and if user details are populated
  if (!isCampaign || !isCampaign.user) {
    throw new Error('Campaign or user not found');
  }

  //@ts-ignore
  const fullName = isCampaign.user.fullName;

  const result = await Invite.create(payload);

  const data = {
    text: `${fullName} invited you to join for events`,
    receiver: payload.influencer,
  };
  await sendNotifications(data);

  return result;
};

const resentInviteToDB = async () => {
  const result = await Invite.find({ status: 'Pending' }).sort({
    createdAt: -1,
  });

  if (!result || result.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No resent campaign found');
  }

  return result;
};
// const createInviteToDB = async (payloads: Partial<IInvite>[]) => {
//   const results = await Invite.insertMany(payloads);

//   const populatedResults = await Invite.populate(results, {
//     path: 'influencer',
//     select: 'fullName',
//   });

//   const firstInfluencerName = (populatedResults[0].influencer as IInfluencer)
//     .fullName;

//   console.log(results);
//   console.log(firstInfluencerName);

//   if (results) {
//     const data = {
//       text: `${firstInfluencerName} invited you to join for events`,
//       receiver: payloads[0].influencer,
//     };
//     await sendNotifications(data);
//   }

//   return populatedResults;
// };

// const getAllInvites = async () => {
//   const result = await Invite.find()
//     .sort({
//       createdAt: -1,
//     })
//     .populate({
//       path: 'campaign',
//       select: 'image name startTime endTime',
//       populate: {
//         path: 'user',
//         select: 'fullName',
//         populate: {
//           path: 'brand',
//           select: 'owner',
//         },
//       },
//     })
//     .populate('influencer');
//   return result;
// };

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
          select: 'owner',
        },
      },
    })
    .populate({
      path: 'influencer',
      select: 'fullName',
    })
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

// const updatedInviteToDB = async (id: string, payload: Partial<IInvite>) => {
//   const invite = await Invite.findById(id);

//   if (!invite) {
//     throw new Error(`Invite with ID ${id} not found`);
//   }

//   const result = await Invite.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         status: payload.status,
//       },
//     },
//     { new: true }
//   );

//   return result;
// };

const updatedInviteToDB = async (id: string, payload: Partial<IInvite>) => {
  const invite = await Invite.findById(id);

  if (!invite) {
    throw new Error(`Invite with ID ${id} not found`);
  }

  // Check if the status is 'Accepted' and modify it to 'Accomplish'
  const updatedStatus =
    payload.status === 'Accepted' ? 'Accomplish' : payload.status;

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

export const InviteService = {
  createInviteToDB,
  getAllInvites,
  updatedInviteToDB,
  resentInviteToDB,
};
