import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IBrand } from './brand.interface';
import { Brand } from './brand.model';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import { brandSearchAbleFields } from './brand.constant';
import { JwtPayload } from 'jsonwebtoken';

const updateBrandToDB = async (email: string, payload: Partial<IBrand>) => {
  payload.status = 'active';

  payload.followersIG = Number(payload.followersIG);
  payload.followersTK = Number(payload.followersTK);

  const result = await Brand.findOneAndUpdate({ email }, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

// const getAllBrands = async (query: Record<string, unknown>) => {
//   const brandQuery = new QueryBuilder(Brand.find().populate('category'), query)
//     .search(brandSearchAbleFields)
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await brandQuery.modelQuery;

//   return result;
// };

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
