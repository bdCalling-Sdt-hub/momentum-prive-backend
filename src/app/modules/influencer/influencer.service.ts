import QueryBuilder from '../../builder/QueryBuilder';
import { InfluencerSearchAbleFields } from './influencer.constant';
import { IInfluencer } from './influencer.interface';
import { Influencer } from './influencer.model';

// const updateInfluencerToDB = async (
//   id: string,
//   payload: Partial<IInfluencer>
// ) => {
//   const result = await Influencer.findByIdAndUpdate(id, payload, {
//     new: true,
//     runValidators: true,
//   });
//   return result;
// };

const updateInfluencerToDB = async (
  id: string,
  payload: Partial<IInfluencer>
) => {
  if (payload.image && !Array.isArray(payload.image)) {
    throw new Error('Image must be an array of strings');
  }

  const result = await Influencer.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllInfluencer = async (
  query: Record<string, unknown>,
  filter: Record<string, any>
) => {
  console.log(query);
  const influencerQuery = new QueryBuilder(Influencer.find(filter), query)
    .search(InfluencerSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await influencerQuery.modelQuery;

  return result;
};

export const InfluencerService = {
  updateInfluencerToDB,
  getAllInfluencer,
};
