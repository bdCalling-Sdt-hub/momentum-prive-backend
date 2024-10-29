import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { collaboratationSearchAbleFields } from './collaboration.constant';
import { ICollaboration } from './collaboration.interface';
import { Collaborate } from './collaboration.model';
import { Campaign } from '../campaign/campaign.model';
import { Interest } from '../interest_influencer/interest.model';
import { Brand } from '../brand/brand.model';
import { Category } from '../category/category.model';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Invite } from '../invite/invite.model';

const createCollaborationToDB = async (payload: ICollaboration) => {
  const isInvite = await Invite.findById(payload.invite);

  const inviteData = isInvite?.campaign;

  const isCampaign = await Campaign.findById(inviteData);

  const isInfluencer = await User.findById(payload.influencer);

  const isUser = await User.findById(isCampaign?.user);

  const isBrand = await Brand.findById(isUser?.brand);

  const isCateory = await Category.findById(isBrand?.category);

  if (!isCateory || !isBrand || !isCampaign) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `${isBrand} ${isCampaign} ${isCateory} not found`
    );
  }

  const isCategoryName = isCateory?.categoryName;

  const value = {
    categoryName: isCategoryName,
    ...payload,
  };

  const result = await Collaborate.create(value);

  const createInterestInfluencer = await Interest.create({
    campaign: isCampaign,
    influencer: result.influencer,
    Collaborate: result._id,
  });

  if (!createInterestInfluencer) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create interest with collaboration details'
    );
  }

  //send notification
  if (result) {
    const data = {
      text: `${isInfluencer?.fullName} Accept your invitation`,
      receiver: isCampaign?.user,
    };

    await sendNotifications(data);
  }
  if (result) {
    const data = {
      text: `${isInfluencer?.fullName} Booking a new Collaboration`,
      receiver: isCampaign?.user,
      type: 'ADMIN',
    };

    await sendNotifications(data);
  }
  //end notification

  return result;
};

const getAllCollaborations = async (
  query: Record<string, unknown>,
  filter: Record<string, any>
) => {
  const collaborateBuilder = new QueryBuilder(
    Collaborate.find(filter)
      .populate({
        path: 'invite',
        populate: {
          path: 'campaign',
        },
      })
      .populate('influencer'),
    query
  )
    .search(collaboratationSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await collaborateBuilder.modelQuery;

  return result;
};

const updatedCollaborationToDB = async (
  id: string,
  payload: Partial<ICollaboration>
) => {
  // Update the collaboration status
  const result = await Collaborate.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const CollaborationService = {
  createCollaborationToDB,
  getAllCollaborations,
  updatedCollaborationToDB,
};
