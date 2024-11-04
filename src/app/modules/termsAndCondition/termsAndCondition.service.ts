import {
  ITermsAndConditionBrand,
  ITermsAndConditionInfluencer,
} from './termsAndCondition.interface';
import {
  TermsAndConditionBrand,
  TermsAndConditionInfluencer,
} from './termsAndCondition.model';

//brand service
const createTermsToDB = async (payload: Partial<ITermsAndConditionBrand>) => {
  try {
    const existingTerm = await TermsAndConditionBrand.findOne();

    if (existingTerm) {
      Object.assign(existingTerm, payload);
      const updatedTerm = await existingTerm.save();
      return updatedTerm;
    } else {
      const newTerm = await TermsAndConditionBrand.create(payload);
      return newTerm;
    }
  } catch (error) {
    throw new Error('Unable to create or update terms.');
  }
};
const getTermsFromDB = async () => {
  const terms = await TermsAndConditionBrand.findOne();
  return terms;
};

//influencer service

const createTermsToDBInfluencer = async (
  payload: Partial<ITermsAndConditionInfluencer>
) => {
  try {
    const existingTerm = await TermsAndConditionInfluencer.findOne();

    if (existingTerm) {
      Object.assign(existingTerm, payload);
      const updatedTerm = await existingTerm.save();
      return updatedTerm;
    } else {
      const newTerm = await TermsAndConditionInfluencer.create(payload);
      return newTerm;
    }
  } catch (error) {
    throw new Error('Unable to create or update terms.');
  }
};

const getTermsFromDBInfluencer = async () => {
  const terms = await TermsAndConditionInfluencer.findOne();
  return terms;
};

export const TermsAndConditionService = {
  createTermsToDB,
  getTermsFromDB,
  getTermsFromDBInfluencer,
  createTermsToDBInfluencer,
};
