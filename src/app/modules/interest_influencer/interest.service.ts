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
import { Brand } from '../brand/brand.model';

const getAllInterest = async (userId: string, status?: string) => {
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

    if (interest.status === 'Completed' || interest.status === 'Rejected') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Interest status is already ${interest.status}`
      );
    }

    const Status = payload.status === 'Accepted' ? 'Completed' : 'Rejected';

    // Update Interest status
    const updatedStatus = await Interest.findByIdAndUpdate(
      id,
      { $set: { status: Status } },
      { new: true, runValidators: true, session }
    );

    if (!updatedStatus) {
      throw new Error('Failed to update Interest');
    }

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

    const isBrand = await Brand.findById(isUser?.brand);
    // Send notifications
    let notificationText;
    if (updatedStatus.status === 'Completed') {
      notificationText = `Accepted your interest`;
    } else if (updatedStatus.status === 'Rejected') {
      notificationText = `Rejected your interest`;
    }

    if (notificationText) {
      const data = {
        text: notificationText,
        receiver: influencerData?.influencer,
        image: isBrand?.image,
        name: isUser?.fullName,
      };
      await sendNotifications(data);
    }
    // Check for valid status transitions

    // Handle Accepted or Rejected status
    if (refetchedStatus.status === 'Completed') {
      // Update collaboration status
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
      // Update collaboration status to 'Rejected'
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

const getSingleInterest = async (id: string) => {
  const result = await Interest.findById(id).populate({
    path: 'influencer',
    select: 'influencer fullName',
    populate: {
      path: 'influencer',
    },
  });

  const submitprove = await Collaborate.findById(result?.collaborate).select(
    'typeStatus image instagram tiktok'
  );

  return { result, submitprove };
};

export const InterestService = {
  getAllInterest,
  updatedInterestStautsToDb,
  getSingleInterest,
};
