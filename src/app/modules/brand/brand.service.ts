import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IBrand } from './brand.interface';
import { Brand } from './brand.model';
import unlinkFile from '../../../shared/unlinkFile';

const updateBrandToDB = async (email: string, payload: Partial<IBrand>) => {
  payload.status = 'active';

  const isExistBrnad = await Brand.findOne({ email });

  if (!isExistBrnad) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (payload.image && isExistBrnad.image) {
    unlinkFile(isExistBrnad.image);
  }

  payload.followersIG = isNaN(Number(payload.followersIG))
    ? 0
    : Number(payload.followersIG);
  payload.followersTK = isNaN(Number(payload.followersTK))
    ? 0
    : Number(payload.followersTK);

  const result = await Brand.findOneAndUpdate({ email }, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const getAllBrands = async (country?: string, city?: string) => {
  const filter: any = {};
  if (country) filter.country = country;
  if (city) filter.city = city;

  const result = await Brand.find(filter).populate({
    path: 'category',
    select: 'categoryName',
  });
  return result;
};
export const BrandService = {
  updateBrandToDB,
  getAllBrands,
};
