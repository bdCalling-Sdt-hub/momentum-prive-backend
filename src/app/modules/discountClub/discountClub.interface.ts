import { Types } from 'mongoose';

export type IDiscountClub = {
  user: Types.ObjectId;
  category: Types.ObjectId;
  image: string;
  buyGuide: string;
  name: string;
  price: string;
  discount: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'deleted';
};
