import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICategory } from './category.interface';
import { Category } from './category.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { CategorySearchAbleFields } from './category.constant';

const createCategiryToDB = async (payload: Partial<ICategory>) => {
  const result = await Category.create(payload);
  return result;
};

// const getAllCategory = async (query: Record<string, unknown>) => {
//   const categoryBuilder = new QueryBuilder(Category.find(), query)
//     .search(CategorySearchAbleFields)
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await categoryBuilder.modelQuery;

//   const count: number = await Category.countDocuments();

//   return { result, count };
// };

const getAllCategory = async (query: Record<string, unknown>) => {
  const { searchTerm, page, limit, ...filterData } = query;
  const anyConditions: any[] = [{ status: 'active' }];

  // Add searchTerm condition if present
  if (searchTerm) {
    anyConditions.push({
      $or: [{ categoryName: { $regex: searchTerm, $options: 'i' } }],
    });
  }

  // Filter by additional filterData fields
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch Category data
  const result = await Category.find(whereConditions)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Category.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const getSingleCategory = async (id: string) => {
  const result = await Category.findOne({ _id: id, status: 'active' });

  if (!result === null) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  return result;
};

const updateCategoryToDB = async (id: string, payload: Partial<ICategory>) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  if (category.status !== 'active') {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Category is not active, cannot be updated'
    );
  }

  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteCategoryToDB = async (id: string) => {
  const result = await Category.findByIdAndDelete(id, {
    status: 'delete',
    new: true,
    runValidators: true,
  });
  return result;
};

export const CategoryService = {
  createCategiryToDB,
  getAllCategory,
  getSingleCategory,
  updateCategoryToDB,
  deleteCategoryToDB,
};
