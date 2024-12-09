import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICampaign } from '../campaign/campaign.interface';
import { Campaign } from '../campaign/campaign.model';
import { User } from '../user/user.model';
import { sendEmail } from '../../../helpers/sendMail';
import { Brand } from '../brand/brand.model';
import { sendNotifications } from '../../../helpers/notificationHelper';

const getAllCampaigns = async () => {
  const result = await Campaign.find();

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  return result;
};

const updatedCampaignStatus = async (
  id: string,
  payload: Partial<ICampaign>
) => {
  // Fetch the campaign and check if it exists
  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  // Fetch the user and brand related to the campaign
  const user = await User.findById(campaign.user);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const brand = await Brand.findById(user.brand);

  if (!brand) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Brand not found');
  }

  // Update the campaign status
  const updatedCampaign = await Campaign.findByIdAndUpdate(
    id,
    { approvalStatus: payload.approvalStatus },
    { new: true, runValidators: true }
  );

  if (!updatedCampaign) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to update campaign');
  }

  const { approvalStatus: newApprovalStatus } = updatedCampaign;
  const { email, fullName, _id: userId } = user;
  const brandImage = brand.image;

  // Send notification if the status is "Approved"
  if (newApprovalStatus === 'Approved') {
    const notificationData = {
      text: `Your Campaign has been ${newApprovalStatus}`,
      receiver: userId,
      name: fullName,
      image: brandImage,
    };
    sendNotifications(notificationData);
  }

  // Send email if the user has an email address
  if (email) {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>Dear ${fullName},</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>${
          newApprovalStatus === 'Approved'
            ? 'Your information is valid.'
            : 'Your information is not valid.'
        }</p>
        <p>${
          newApprovalStatus === 'Approved'
            ? 'Thank you for joining us!'
            : "Sorry, you can't join with us."
        }</p>
      </div>
    `;
    await sendEmail(
      email,
      `Your Campaign has been ${newApprovalStatus}`,
      emailContent
    );
  } else {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Email is missing');
  }

  return updatedCampaign;
};

export const updatedCampaignStatusService = {
  updatedCampaignStatus,
  getAllCampaigns,
};
