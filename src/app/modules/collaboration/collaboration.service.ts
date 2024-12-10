import { status } from './../showInterest/showInterest.constant';
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
import { populate } from 'dotenv';

const createCollaborationToDB = async (payload: ICollaboration) => {
  const invited = await Invite.findById(payload.invite);
  if (!invited) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invite not found');
  }
  if (invited.status === 'Cancel' || invited.status === 'Pending') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invite is ${invited.status} you cannot collaborate`
    );
  }

  // Fetch necessary data in parallel to reduce query time
  const [isInvite, isInfluencer] = await Promise.all([
    Invite.findById(payload.invite),
    User.findById(payload.influencer),
  ]);

  const isExistSubmitProve = await Collaborate.findOne({
    invite: payload.invite,
  });
  if (isExistSubmitProve) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You have already submitted prove for this collaboration'
    );
  }

  if (!isInvite) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invite not found');
  }

  if (['Rejected', 'Pending'].includes(isInvite.status)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invite is ${isInvite.status}, you cannot collaborate`
    );
  }

  const isCampaign = await Campaign.findById(isInvite.campaign);
  if (!isCampaign) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  const isUser = await User.findById(isCampaign.user);
  const isBrand = await Brand.findById(isUser?.brand).lean();
  const isCategory = await Category.findById(isBrand?.category);

  if (!isBrand || !isCategory) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `${!isBrand ? 'Brand' : 'Category'} not found`
    );
  }

  const categoryName = isCategory?.categoryName;

  // Fetch influencer image data
  const influencerImage = await Influencer.findById(
    isInfluencer?.influencer
  ).lean();
  const firstImage = influencerImage?.image?.[0] || null;

  // Prepare collaboration payload
  const collaborationData = {
    categoryName,
    ...payload,
  };

  // Create collaboration and interest records in parallel
  const collaboration = await Collaborate.create(collaborationData);

  // Ensure collaboration was created
  if (!collaboration) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create collaboration'
    );
  }

  if (collaboration?.typeStatus === 'Review') {
    await Invite.findOneAndUpdate(
      { _id: payload.invite },
      { completeStatus: 'Completed' },
      { new: true }
    );
  }
  const interest = await Interest.create({
    campaign: isCampaign._id,
    influencer: payload.influencer,
    collaborate: collaboration._id, // Use the _id of the newly created collaboration
  });

  if (!interest) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create interest with collaboration details'
    );
  }

  // Send notifications if collaboration creation is successful
  const notifications = [
    {
      text: `Accepted your invitation`,
      receiver: isCampaign.user,
      name: isInfluencer?.fullName,
      image: firstImage,
    },
    {
      text: `${isInfluencer?.fullName} booking a new service`,
      name: isInfluencer?.fullName,
      type: 'ADMIN',
    },
  ];

  await Promise.all(notifications.map(data => sendNotifications(data)));

  return collaboration;
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

const getAllCollaborationForInfluencer = async (
  influencerId: string,
  typeStatus?: string
) => {
  const filter: Record<string, any> = { influencer: influencerId };

  // Add typeStatus to the filter if it is provided
  if (typeStatus) {
    filter.typeStatus = typeStatus;
  }

  const result = await Collaborate.find(filter).populate({
    path: 'invite',
    populate: {
      path: 'campaign',
      populate: {
        path: 'user',
        select: 'brand fullName',
        populate: {
          path: 'brand',
        },
      },
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
