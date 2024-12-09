import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { packageSearchAbleFields } from './package.constant';
import { IPackage } from './package.interface';
import { Package } from './package.model';

const createPackage = async (payload: Partial<IPackage>) => {
  const result = await Package.create(payload);

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create package');
  }

  return result;
};

const getAllPackage = async (query: Record<string, unknown>) => {
  const studentQuery = new QueryBuilder(Package.find(), query)
    .search(packageSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await studentQuery.modelQuery;
  return result;
};

const updatePackage = async (id: string, payload: Partial<IPackage>) => {
  const result = await Package.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  return result;
};

export const PackageService = {
  createPackage,
  getAllPackage,
  updatePackage,
};
