import { populate } from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Collaborate } from '../collaboration/collaboration.model';
import { IInterest } from './interest.interface';
import { Interest } from './interest.model';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Campaign } from '../campaign/campaign.model';
import { Invite } from '../invite/invite.model';
import mongoose from 'mongoose';

const getAllInterest = async (userId: string, status?: string) => {
  // Base filter conditions
  const baseConditions: Record<string, any> = { campaign: userId };

  // Add status filter if provided
  if (status) {
    baseConditions['status'] = status;
  }

  const result = await Interest.find(baseConditions)
    .populate({
      path: 'campaign',
      populate: {
        path: 'user',
        select: 'fullName',
      },
    })
    .populate({
      path: 'influencer',
      select: 'fullName',
      populate: {
        path: 'influencer',
      },
    });

  const count = result.length;

  return { result, count };
};

const updatedInterestStautsToDb = async (
  id: string,
  payload: Partial<IInterest>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the Interest document first
    const interest = await Interest.findById(id).session(session);
    if (!interest) {
      throw new Error('Interest not found');
    }

    // Check if the status is already updated to the same value
    if (interest.status === payload.status) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Interest status is already updated to the same value'
      );
    }

    const isCampaip = await Campaign.findById(interest.campaign);

    // Update Interest status
    const updatedStatus = await Interest.findByIdAndUpdate(
      id,
      { $set: { status: payload.status } },
      { new: true, runValidators: true, session }
    );

    if (!updatedStatus) {
      throw new Error('Failed to update Interest');
    }

    // Re-fetch the updated status after the update operation
    const refetchedStatus = await Interest.findById(id).session(session);
    if (!refetchedStatus) {
      throw new Error('Interest not found after update');
    }

    const isCampaign = await Campaign.findById(
      refetchedStatus.campaign
    ).session(session);
    if (!isCampaign) {
      throw new Error('Campaign not found');
    }

    const isUser = await User.findById(isCampaign.user).session(session);
    const collaborationId = refetchedStatus.collaborate;
    const influencerId = refetchedStatus.influencer;
    const influencerData = await User.findById(influencerId).session(session);

    // Send notifications
    const notificationText = `${isUser?.fullName} ${
      refetchedStatus.status === 'Accepted' ? 'Accepted' : 'Rejected'
    } your interest`;
    const data = { text: notificationText, receiver: influencerData };
    await sendNotifications(data);

    // Handle Accepted or Rejected status
    if (refetchedStatus.status === 'Accepted') {
      const updateCollaboration = await Collaborate.findByIdAndUpdate(
        collaborationId,
        { $set: { typeStatus: 'Completed' } },
        { new: true, runValidators: true, session }
      );

      // Update Invite status
      await Invite.findByIdAndUpdate(
        id,
        { $set: { status: 'Accepted' } },
        { new: true, runValidators: true, session }
      );

      // Increment influencerCount in Campaign
      await Campaign.findByIdAndUpdate(
        isCampaign._id,
        { $inc: { influencerCount: 1 } },
        { new: true, runValidators: true, session }
      );

      // Commit transaction
      await session.commitTransaction();
      return updateCollaboration;
    } else if (refetchedStatus.status === 'Rejected') {
      const update = await Collaborate.findByIdAndUpdate(
        collaborationId,
        { $set: { typeStatus: 'Rejected' } },
        { new: true, runValidators: true, session }
      );

      // Update Invite status
      await Invite.findByIdAndUpdate(
        id,
        { $set: { status: 'Rejected' } },
        { new: true, runValidators: true, session }
      );

      // Commit transaction
      await session.commitTransaction();
      return update;
    }

    // Commit transaction for other statuses
    await session.commitTransaction();
    return refetchedStatus;
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
};

// const updatedInterestStautsToDb = async (
//   id: string,
//   payload: Partial<IInterest>
// ) => {
//   const updatedStatus = await Interest.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         status: payload.status,
//       },
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   if (!updatedStatus) {
//     throw new Error('Interest not found');
//   }

//   const isInterest = await Interest.findById(id);
//   const isCampaign = await Campaign.findById(isInterest?.campaign);
//   const isUser = await User.findById(isCampaign?.user);

//   const collaborationId = updatedStatus.collaborate;
//   const influencerId = updatedStatus.influencer;
//   const influencerData = await User.findById(influencerId);

//   // Send notifications
//   const notificationText = `${isUser?.fullName} ${
//     updatedStatus.status === 'Accepted' ? 'Accept' : 'Reject'
//   } your interest`;
//   const data = { text: notificationText, receiver: influencerData };
//   await sendNotifications(data);

//   // Update collaboration status
//   if (updatedStatus.status === 'Accepted') {
//     const updateCollaboration = await Collaborate.findByIdAndUpdate(
//       collaborationId,
//       { $set: { typeStatus: 'Completed' } },
//       { new: true, runValidators: true }
//     );
//     // Update Invite status before returning
//     await Invite.findByIdAndUpdate(
//       id,
//       { $set: { status: payload.status } },
//       { new: true, runValidators: true }
//     );
//     return updateCollaboration;
//   } else if (updatedStatus.status === 'Rejected') {
//     const update = await Collaborate.findByIdAndUpdate(
//       collaborationId,
//       { $set: { typeStatus: 'Rejected' } },
//       { new: true, runValidators: true }
//     );
//     // Update Invite status before returning
//     await Invite.findByIdAndUpdate(
//       id,
//       { $set: { status: payload.status } },
//       { new: true, runValidators: true }
//     );
//     return update;
//   }

//   return updatedStatus;
// };

const getSingleInterest = async (id: string) => {
  const result = await Interest.findById(id);

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
