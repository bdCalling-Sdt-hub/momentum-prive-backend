import QueryBuilder from '../../builder/QueryBuilder';
import { packageSearchAbleFields } from './package.constant';
import { IPackage } from './package.interface';
import { Package } from './package.model';

const createPackage = async (payload: Partial<IPackage>) => {
  const result = await Package.create(payload);

  return result;
};

const getAllPackage = async (query: Record<string, any>) => {
  const packageBuilder = new QueryBuilder(Package.find(), query)
    .search(packageSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await packageBuilder.modelQuery;

  return result;
};

const updatePackage = async (id: string, payload: Partial<IPackage>) => {
  const result = await Package.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

export const PackageService = {
  createPackage,
  getAllPackage,
  updatePackage,
};
