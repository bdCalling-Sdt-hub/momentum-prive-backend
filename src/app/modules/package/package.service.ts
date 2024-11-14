import { IPackage } from './package.interface';
import { Package } from './package.model';

const createPackage = async (payload: Partial<IPackage>) => {
  const result = await Package.create(payload);

  return result;
};

const getAllPackage = async (filter: Record<string, any>) => {
  const result = await Package.find(filter);
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
