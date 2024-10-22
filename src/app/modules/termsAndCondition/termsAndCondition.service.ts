import { ITermsAndCondition } from './termsAndCondition.interface';
import { Terms } from './termsAndCondition.model';

const createTermsToDB = async (payload: Partial<ITermsAndCondition>) => {
  try {
    const existingTerm = await Terms.findOne();

    if (existingTerm) {
      Object.assign(existingTerm, payload);
      const updatedTerm = await existingTerm.save();
      return updatedTerm;
    } else {
      const newTerm = await Terms.create(payload);
      return newTerm;
    }
  } catch (error) {
    throw new Error('Unable to create or update terms.');
  }
};
const getTermsFromDB = async () => {
  const terms = await Terms.find();
  return terms;
};

export const TermsAndConditionService = {
  createTermsToDB,
  getTermsFromDB,
};
