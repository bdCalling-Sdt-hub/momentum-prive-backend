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

const createCollaborationToDB = async (payload: ICollaboration) => {
  const isCampaign = await Campaign.findById(payload.campaign);

  const isBrand = await Brand.findById(isCampaign?.brand);

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
    campaign: result.campaign,
    influencer: result.influencer,
    Collaborate: result._id,
  });

  if (!createInterestInfluencer) {
    return `Failed to create interest with collaboration details`;
  }

  return result;
};

const getAllCollaborations = async (
  query: Record<string, unknown>,
  filter: Record<string, any>
) => {
  const collaborateBuilder = new QueryBuilder(
    Collaborate.find(filter).populate('campaign').populate('influencer'),
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
