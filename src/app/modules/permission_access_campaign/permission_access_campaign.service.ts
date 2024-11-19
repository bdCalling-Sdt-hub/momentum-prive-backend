import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICampaign } from '../campaign/campaign.interface';
import { Campaign } from '../campaign/campaign.model';
import { User } from '../user/user.model';
import { sendEmail } from '../../../helpers/sendMail';

const getAllCampaigns = async () => {
  const result = await Campaign.find();
  return result;
};

const updatedCampaignStatus = async (
  id: string,
  payload: Partial<ICampaign>
) => {
  const isExistCampaign = await Campaign.findById(id);

  const isStatus = isExistCampaign?.approvalStatus;

  const isUserBrand = await User.findById(isExistCampaign?.user);

  const result = await Campaign.findByIdAndUpdate(
    id,
    {
      approvalStatus: payload.approvalStatus,
      new: true,
      runValidators: true,
    },
    { new: true }
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  console.log(result);

  if (isUserBrand?.email) {
    await sendEmail(
      isUserBrand.email,
      `Your Campaign has been ${isStatus}`,
      `
                <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                  <p>Dear ${isUserBrand.fullName},</p>
                  <p><strong>Email:</strong> ${isUserBrand.email}</p>
                   <p>${
                     isStatus === 'Approved'
                       ? 'Your information is valid.'
                       : 'Your information is not valid.'
                   }</p>
                  <p>${
                    isStatus === 'Approved'
                      ? 'Thank you for joining us!.'
                      : "Sorry you can't join with us."
                  }</p>
                </div>
              `
    );
  } else {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Email is missing');
  }

  return result;
};

export const updatedCampaignStatusService = {
  updatedCampaignStatus,
  getAllCampaigns,
};
