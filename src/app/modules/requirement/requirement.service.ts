import { IRequirement } from './requirement.interface';
import { Requirement } from './requirement.model';

const createRequirementToDB = async (payload: Partial<IRequirement>) => {
  const result = await Requirement.create(payload);
  return result;
};

export const RequirementService = {
  createRequirementToDB,
};
