import { IPackage } from './package.interface';
import { Package } from './package.model';

const createPackage = async (payload: Partial<IPackage>) => {
  const result = await Package.create(payload);

  return result;
};

export const PackageService = {
  createPackage,
};
