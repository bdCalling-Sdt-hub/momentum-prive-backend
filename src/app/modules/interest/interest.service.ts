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
import { populate } from 'dotenv';
import mongoose from 'mongoose';

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
const getAllInterest = async (userId: string, status?: string) => {
  if (!userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'UserId is required');
  }

  const baseConditions: Record<string, any> = { campaign: userId };

  // Add status filter if provided
  if (status) {
    baseConditions['status'] = status;
  }

  // Add status filter if provided
  if (status) {
    baseConditions['status'] = status;
  }

  const allResults = await InterestInfluencer.find(baseConditions)
    .populate({
      path: 'influencer',
      select: 'fullName',
      populate: {
        path: 'influencer',
      },
    })
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
    (item: any) => item.campaign && item.campaign._id.toString() === userId
  );

  // if (filteredResult.length === 0) {
  //   throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
  // }

  const count = filteredResult.length;
  // if (!count) {
  //   throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
  // }

  return { result: filteredResult, count };
};

// const updatedInterestStautsToDb = async (
//   id: string,
//   payload: Partial<IInterestInfo>
// ) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   const Status = payload.status === 'Accepted' ? 'Completed' : 'Rejected';

//   try {
//     const updatedStatus = await InterestInfluencer.findByIdAndUpdate(
//       id,
//       {
//         $set: {
//           status: Status,
//         },
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!updatedStatus) {
//       throw new Error('Interest not found');
//     }

//     const isInsterest = await InterestInfluencer.findById(id);
//     const isCampaign = await Campaign.findById(isInsterest?.campaign);
//     const isUser = await User.findById(isCampaign?.user);

//     const collaborationId = updatedStatus.submitProve;
//     const trackId = updatedStatus.track;

//     // Send notifications
//     const influencerId = updatedStatus.influencer;
//     const influencerData = await User.findById(influencerId);

//     let data;
//     if (updatedStatus.status === 'Completed') {
//       data = {
//         text: `${isUser?.fullName} Accept your interest`,
//         receiver: influencerData,
//       };
//       await sendNotifications(data);
//     } else if (updatedStatus.status === 'Rejected') {
//       data = {
//         text: `${isUser?.fullName} Reject your interest`,
//         receiver: influencerData,
//       };
//       await sendNotifications(data);
//     }

//     // Now, only update collaboration and track based on specific statuses
//     if (
//       updatedStatus.status === 'Completed' ||
//       updatedStatus.status === 'Rejected'
//     ) {
//       const statusToUpdate = updatedStatus.status; // 'Completed' or 'Rejected'

//       // Update the collaboration and track status
//       const updateSubmitProve = await SubmitProve.findByIdAndUpdate(
//         collaborationId,
//         {
//           $set: {
//             typeStatus: statusToUpdate,
//           },
//         },
//         {
//           new: true,
//           runValidators: true,
//         }
//       );

//       // const updateTrack = await Track.findByIdAndUpdate(
//       //   trackId,
//       //   {
//       //     $set: {
//       //       status: statusToUpdate,
//       //     },
//       //   },
//       //   {
//       //     new: true,
//       //     runValidators: true,
//       //   }
//       // );

//       return {
//         updatedStatus,
//         updateSubmitProve,
//         // updateTrack,
//       };
//     }

//     return updatedStatus;
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     // End session
//     session.endSession();
//   }
// };

const updatedInterestStautsToDb = async (
  id: string,
  payload: Partial<IInterestInfo>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch InterestInfluencer
    const interest = await InterestInfluencer.findById(id).session(session);
    if (!interest) {
      throw new Error('Interest not found');
    }

    // Check if the status is already updated to the same value
    if (interest.status === 'Completed' || interest.status === 'Rejected') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Interest status is already updated'
      );
    }

    // Fetch Campaign associated with Interest
    const campaigns: any = await Campaign.findById(interest.campaign).session(
      session
    );

    // Validate collaborationLimit and influencerCount
    if (payload.status === 'Accepted') {
      if (campaigns?.influencerCount >= campaigns?.collaborationLimit) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'You have reached the limit of collaborations'
        );
      }
    }

    const Status = payload.status === 'Accepted' ? 'Completed' : 'Rejected';

    // Update InterestInfluencer status
    const updatedStatus = await InterestInfluencer.findByIdAndUpdate(
      id,
      {
        $set: { status: Status },
      },
      {
        new: true,
        runValidators: true,
        session, // Ensure session is used
      }
    );

    if (!updatedStatus) {
      throw new Error('Interest update failed');
    }

    // Fetch additional related data
    const isCampaign = await Campaign.findById(updatedStatus.campaign).session(
      session
    );
    const isUser = await User.findById(isCampaign?.user).session(session);
    const influencerData = await User.findById(
      updatedStatus.influencer
    ).session(session);

    // Send notifications
    let notificationText;
    if (updatedStatus.status === 'Accepted') {
      notificationText = ` accepted your interest`;
    } else if (updatedStatus.status === 'Rejected') {
      notificationText = ` rejected your interest`;
    }

    if (notificationText) {
      const data = { text: notificationText, receiver: influencerData };
      await sendNotifications(data);
    }

    // Handle collaboration updates for Completed or Rejected statuses
    if (['Completed', 'Rejected'].includes(updatedStatus.status)) {
      const statusToUpdate = updatedStatus.status;

      const updateSubmitProve = await SubmitProve.findByIdAndUpdate(
        updatedStatus.submitProve,
        { $set: { typeStatus: statusToUpdate } },
        {
          new: true,
          runValidators: true,
          session, // Ensure session is used
        }
      );

      // const updateTrack = await Track.findByIdAndUpdate(
      //   updatedStatus.track,
      //   { $set: { status: statusToUpdate } },
      //   {
      //     new: true,
      //     runValidators: true,
      //     session, // Ensure session is used
      //   }
      // );

      // Increment influencerCount if status is Completed

      if (updatedStatus.status === 'Completed') {
        await Campaign.findByIdAndUpdate(
          updatedStatus.campaign,
          { $inc: { influencerCount: 1 } }, // Increment influencerCount
          { session }
        );
      }

      // Commit transaction
      await session.commitTransaction();
      return {
        updatedStatus,
        updateSubmitProve,
      };
    }

    // Commit transaction for other statuses
    await session.commitTransaction();
    return updatedStatus;
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
};

const getSingleInterest = async (id: string) => {
  const result = await InterestInfluencer.findById(id)
    .populate({
      path: 'submitProve',
      select: 'image tiktok instagram typeStatus',
    })
    .populate({
      path: 'influencer',
      select: 'influencer fullName',
      populate: {
        path: 'influencer',
        // select: 'fullName followersIG',
      },
    })
    .populate({
      path: 'campaign',
    });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No data found');
  }

  return result;
};

export const InterestService = {
  getAllInterest,
  updatedInterestStautsToDb,
  getSingleInterest,
};
