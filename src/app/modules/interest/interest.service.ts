import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Campaign } from '../campaign/campaign.model';
import { ShowInterest } from '../showInterest/showInterest.model';
import { SubmitProve } from '../submitProve/submitProve.model';
import { Track } from '../track/track.model';
import { User } from '../user/user.model';
import { IInterestInfo } from './interest.interface';
import { InterestInfluencer } from './interest.model';

// const getAllInterest = async (campaignId: string) => {
//   const query = campaignId ? { campaign: campaignId } : {};

//   const count = await InterestInfluencer.countDocuments(query);

//   const result = await InterestInfluencer.find(query)
//     .populate({
//       path: 'campaign',
//       select: 'name',
//       populate: {
//         path: 'user',
//         select: 'fullName',
//         populate: {
//           path: 'brand',
//           select: 'owner',
//         },
//       },
//     })
//     .populate({
//       path: 'influencer',
//       select: 'fullName',
//       populate: {
//         path: 'influencer',
//         select: 'fullName ',
//       },
//     });

//   return { result, count };
// };
const getAllInterest = async (userId: string) => {
  if (!userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'UserId is required');
  }

  const allResults = await InterestInfluencer.find({})
    .populate('influencer', 'fullName')
    .populate({
      path: 'campaign',
      select: 'user image name',
      populate: {
        path: 'user',
        select: 'brand',
        populate: {
          path: 'brand',
          select: 'image owner',
        },
      },
    });

  const filteredResult = allResults.filter(
    (item: any) => item.campaign && item.campaign.user._id.toString() === userId
  );

  if (filteredResult.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
  }

  const count = filteredResult.length;
  if (!count) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
  }

  return { result: filteredResult, count };
};

const updatedInterestStautsToDb = async (
  id: string,
  payload: Partial<IInterestInfo>
) => {
  const updatedStatus = await InterestInfluencer.findByIdAndUpdate(
    id,
    {
      $set: {
        status: payload.status,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedStatus) {
    throw new Error('Interest not found');
  }

  const isInsterest = await InterestInfluencer.findById(id);
  const isCampaign = await Campaign.findById(isInsterest?.campaign);
  const isUser = await User.findById(isCampaign?.user);

  const collaborationId = updatedStatus.submitProve;
  const trackId = updatedStatus.track;

  // Send notifications
  const influencerId = updatedStatus.influencer;
  const influencerData = await User.findById(influencerId);

  let data;
  if (updatedStatus.status === 'Completed') {
    data = {
      text: `${isUser?.fullName} Accept your interest`,
      receiver: influencerData,
    };
    await sendNotifications(data);
  } else if (updatedStatus.status === 'Rejected') {
    data = {
      text: `${isUser?.fullName} Reject your interest`,
      receiver: influencerData,
    };
    await sendNotifications(data);
  }

  // Now, only update collaboration and track based on specific statuses
  if (
    updatedStatus.status === 'Completed' ||
    updatedStatus.status === 'Rejected'
  ) {
    const statusToUpdate = updatedStatus.status; // 'Completed' or 'Rejected'

    // Update the collaboration and track status
    const updateSubmitProve = await SubmitProve.findByIdAndUpdate(
      collaborationId,
      {
        $set: {
          typeStatus: statusToUpdate,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    const updateTrack = await Track.findByIdAndUpdate(
      trackId,
      {
        $set: {
          status: statusToUpdate,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    const updatedInterst = await ShowInterest.findByIdAndUpdate(
      influencerId,
      {
        $set: {
          status: statusToUpdate,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return {
      updatedStatus,
      updateSubmitProve,
      updateTrack,
      updatedInterst,
    };
  }

  return updatedStatus;
};

export const InterestService = {
  getAllInterest,
  updatedInterestStautsToDb,
};
