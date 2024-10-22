import { Types } from 'mongoose';

export type ISubscriptation = {
  category: 'Gold' | 'Silver' | 'Discount';
  price: string;
  startTime: string;
  endTime: string;
  brand: Types.ObjectId;
  option1?: string;
  option2?: string;
  option3?: string;
  priceId?: string;
  status: 'active' | 'deleted';
};
