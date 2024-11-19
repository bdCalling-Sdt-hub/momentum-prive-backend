import { query } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { UpdateInfluencerPayload } from './influencer.interface';
import { Influencer } from './influencer.model';

import unlinkFile from '../../../shared/unlinkFile';
import { User } from '../user/user.model';

const updateInfluencerToDB = async (
  email: string,
  payload: UpdateInfluencerPayload
) => {
  const isExistInfluencer = await Influencer.findOne({ email });

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

  payload.followersIG = Number(payload.followersIG);
  payload.followersTK = Number(payload.followersTK);

  const updateData = {
    ...payload,
    image: updatedImages,
  };

  // Step 4: Save the updated influencer data
  const result = await Influencer.findOneAndUpdate({ email }, updateData, {
    new: true,
  });

  return result;
};

// const updateInfluencerToDB = async (
//   email: string,
//   payload: UpdateInfluencerPayload
// ) => {
//   const isExistInfluencer = await Influencer.findOne({ email });

//   if (!isExistInfluencer) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "Influencer doesn't exist!");
//   }

//   // Delete specified images if any
//   if (payload.imagesToDelete && payload.imagesToDelete.length > 0) {
//     for (let image of payload.imagesToDelete) {
//       unlinkFile(image); // Assume unlinkFile handles deleting files from storage
//     }

//     // Remove deleted images from the existing image array
//     isExistInfluencer.image = isExistInfluencer.image.filter(
//       (img: string) => !payload.imagesToDelete!.includes(img)
//     );
//   }

//   // Merge new and existing images
//   const updatedImages = payload.image
//     ? [...isExistInfluencer.image, ...payload.image]
//     : isExistInfluencer.image;

//   // Prepare the updated data
//   const updateData = {
//     ...payload,
//     image: updatedImages,
//   };

//   // Update influencer details using email
//   const result = await Influencer.findOneAndUpdate(
//     { email }, // Query condition
//     updateData, // Update data
//     { new: true } // Return the updated document
//   );

//   return result;
// };

const getAllInfluencer = async (country?: string, city?: string) => {
  const filter: any = {};
  if (country) filter.country = country;
  if (city) filter.city = city;

  const result = await Influencer.find(filter);
  return result;
};

const getAllInfluencerBrand = async (query: Record<string, unknown>) => {};

export const InfluencerService = {
  updateInfluencerToDB,
  getAllInfluencer,
  getAllInfluencerBrand,
};
