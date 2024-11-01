import QueryBuilder from '../../builder/QueryBuilder';
import { InfluencerSearchAbleFields } from './influencer.constant';
import { IInfluencer } from './influencer.interface';
import { Influencer } from './influencer.model';

// const updateInfluencerToDB = async (
//   id: string,
//   payload: Partial<IInfluencer>
// ) => {
//   const { image, ...remainingData } = payload;

//   const modifiedUpdateData: Record<string, unknown> = {
//     ...remainingData,
//   };

//   if (image && image.length > 0) {
//     for (const [index, value] of image.entries()) {
//       modifiedUpdateData[`image.${index}`] = value;
//     }
//   }

//   const result = await Influencer.findByIdAndUpdate(id, modifiedUpdateData, {
//     new: true,
//     runValidators: true,
//   });
//   return result;
// };

const updateInfluencerToDB = async (
  id: string,
  payload: Partial<IInfluencer>
) => {
  const { image, ...remainingData } = payload;

  const modifiedUpdateData: Record<string, unknown> = {
    ...remainingData,
  };

  if (image && image.length > 0) {
    const currentInfluencer = await Influencer.findById(id);

    if (currentInfluencer) {
      const updatedImages = [...currentInfluencer.image];

      image.forEach((value, index) => {
        if (value) {
          updatedImages[index] = value;
        }
      });

      modifiedUpdateData.image = updatedImages;
    }
  }

  // Update the influencer document with modified update data
  const result = await Influencer.findByIdAndUpdate(id, modifiedUpdateData, {
    new: true,
    runValidators: true,
  });

  return result;
};

const getAllInfluencer = async (
  query: Record<string, unknown>,
  filter: Record<string, any>
) => {
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
