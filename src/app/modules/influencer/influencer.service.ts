import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { UpdateInfluencerPayload } from './influencer.interface';
import { Influencer } from './influencer.model';

import unlinkFile from '../../../shared/unlinkFile';

const updateInfluencerToDB = async (
  id: string,
  payload: UpdateInfluencerPayload
) => {
  const isExistInfluencer = await Influencer.findById(id);

  if (!isExistInfluencer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Influencer doesn't exist!");
  }

  if (payload.imagesToDelete && payload.imagesToDelete.length > 0) {
    for (let image of payload.imagesToDelete) {
      unlinkFile(image);
    }
    // Remove deleted images from the existing image array
    isExistInfluencer.image = isExistInfluencer.image.filter(
      (img: string) => !payload.imagesToDelete!.includes(img)
    );
  }

  const updatedImages = payload.image
    ? [...isExistInfluencer.image, ...payload.image]
    : isExistInfluencer.image;

  const updateData = {
    ...payload,
    image: updatedImages,
  };

  // Step 4: Save the updated influencer data
  const result = await Influencer.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  return result;
};

const getAllInfluencer = async (country?: string, city?: string) => {
  const filter: any = {};
  if (country) filter.country = country;
  if (city) filter.city = city;

  const result = await Influencer.find(filter);
  return result;
};

export const InfluencerService = {
  updateInfluencerToDB,
  getAllInfluencer,
};
