import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Campaign } from '../campaign/campaign.model';
import { Category } from '../category/category.model';
import { InterestInfluencer } from '../interest/interest.model';
import { ISubmitProve } from './submitProve.interface';
import { SubmitProve } from './submitProve.model';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';

const submitProveToDB = async (payload: ISubmitProve) => {
  const isCampaign = await Campaign.findById(payload.campaign);

  const isCategory = await Category.findById(isCampaign?.category);

  const category = isCategory?.categoryName;

  const value = {
    categoryName: category,
    ...payload,
  };

  const isInfluencer = await User.findById(payload.influencer);

  const result = await SubmitProve.create(value);

  const createInterestInfluencer = await InterestInfluencer.create({
    campaign: isCampaign,
    influencer: result.influencer,
    submitProve: result._id,
  });

  if (!createInterestInfluencer) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create interestInfluencer with SubmitProve details'
    );
  }

  if (result) {
    const data = {
      text: `${isInfluencer?.fullName} accepted your invitation`,
      receiver: isCampaign?.user,
    };

    await sendNotifications(data);

    const bookingData = {
      text: `${isInfluencer?.fullName} Submit new Prove`,
      receiver: isCampaign?.user,
      type: 'ADMIN',
    };

    await sendNotifications(bookingData);
  }
  return result;
};

export const SubmitProveService = {
  submitProveToDB,
};
