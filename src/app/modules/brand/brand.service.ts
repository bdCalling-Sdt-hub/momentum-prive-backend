import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IBrand } from './brand.interface';
import { Brand } from './brand.model';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import { brandSearchAbleFields } from './brand.constant';
import { JwtPayload } from 'jsonwebtoken';

const updateBrandToDB = async (id: string, payload: Partial<IBrand>) => {
  payload.status = 'active';
  const result = await Brand.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  console.log(result);
  return result;
};

const getAllBrands = async (
  query: Record<string, unknown>,
  filter: Record<string, any>
) => {
  const brandQuery = new QueryBuilder(
    Brand.find(filter).populate('category'),
    query
  )
    .search(brandSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await brandQuery.modelQuery;

  return result;
};

export const BrandService = {
  updateBrandToDB,
  getAllBrands,
};
