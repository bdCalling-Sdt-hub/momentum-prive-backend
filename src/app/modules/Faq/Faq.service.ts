import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IFaq } from './Faq.interface';
import { Faq } from './Faq.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { faqSearchAbleFields } from './Faq.constant';

const createFaqToDB = async (payload: Partial<IFaq>) => {
  const isFaqExist = await Faq.findOne({
    question: payload.question,
  });

  if (isFaqExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Faq already exist');
  }

  const result = await Faq.create(payload);
  return result;
};

const getAllFaq = async (query: Record<string, unknown>) => {
  const faqBuilder = new QueryBuilder(Faq.find(), query)
    .search(faqSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await faqBuilder.modelQuery;

  return result;
};

const getSingleFaq = async (id: string) => {
  const result = await Faq.findById(id);
  return result;
};

const updateFaq = async (id: string, payload: Partial<IFaq>) => {
  const isFaqExist = await Faq.findOne({
    question: payload.question,
  });

  if (isFaqExist) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Faq already exist please then update'
    );
  }
  const result = await Faq.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteFaq = async (id: string) => {
  const result = await Faq.findByIdAndUpdate(
    id,
    { status: 'delete' },
    { new: true, runValidators: true }
  );
  return result;
};

export const FaqService = {
  createFaqToDB,
  getAllFaq,
  getSingleFaq,
  updateFaq,
  deleteFaq,
};
