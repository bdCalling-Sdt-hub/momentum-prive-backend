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
import { Influencer } from '../influencer/influencer.model';

const createCollaborationToDB = async (payload: ICollaboration) => {
  const isInvite = await Invite.findById(payload.invite);
  const inviteData = isInvite?.campaign;
  const isCampaign = await Campaign.findById(inviteData);
  const isInfluencer: any = await User.findById(payload.influencer);
  const isUser = await User.findById(isCampaign?.user);
  const isBrand = await Brand.findById(isUser?.brand).lean();
  const isCateory = await Category.findById(isBrand?.category);

  const collaborationLimits = isCampaign?.collaborationLimit ?? 0;

  if (!isCampaign) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  if (!isCateory || !isBrand || !isCampaign) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `${isBrand} ${isCampaign} ${isCateory} not found`
    );
  }

  try {
    // Ensure the campaign ID exists and is valid
    if (!isCampaign._id) {
      throw new Error('Campaign ID is missing');
    }

    // Get the count of collaborations for this specific campaign
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Could not retrieve collaboration count'
    );
  }

  const isCategoryName = isCateory?.categoryName;
  const value = {
    categoryName: isCategoryName,
    ...payload,
  };

  // Fetch influencer image data
  const influenceerImage = await Influencer.findById(isInfluencer?.influencer);

  // Map image array and take the first image if available
  const firstImage = influenceerImage?.image?.[0] || null;

  // Uncomment to create collaboration and interest records

  const result = await Collaborate.create(value);
  const createInterestInfluencer = await Interest.create({
    campaign: isCampaign,
    influencer: result.influencer,
    collaborate: result._id,
  });

  if (!createInterestInfluencer) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create interest with collaboration details'
    );
  }

  // Send notification if collaboration is successfully created
  if (result) {
    const data = {
      text: `${isInfluencer?.fullName} accepted your invitation`,
      receiver: isCampaign?.user,
      name: isInfluencer?.fullName,
      image: firstImage,
    };
    await sendNotifications(data);

    const bookingData = {
      text: `${isInfluencer?.fullName} booked a new Collaboration`,
      name: isInfluencer?.fullName,
      type: 'ADMIN',
    };
    await sendNotifications(bookingData);
  }

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

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No collaboration found');
  }

  return result;
};
const getAllCollaborationForInfluencer = async (influencerId: string) => {
  const result = await Collaborate.find({ influencer: influencerId }).populate({
    path: 'invite',
    populate: {
      path: 'campaign',
    },
  });

  const count = result.length;

  return { result, count };
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

  getAllCollaborationForInfluencer,
};

// const [isInvite,inviteData,isCampaign,isInfluencer,isUser] =await Promise.all([
//   Invite.findById(payload.invite),
//   Campaign.findById(payload.invite),
//   User.findById(payload.influencer),
//   User.findById(payload.campaign),
//   User.findById(payload.user)
// ])
