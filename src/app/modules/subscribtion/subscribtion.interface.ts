import { Types } from 'mongoose';
export type ISubscribtion = {
  customerId: string;
  plan: string;
  status: string;
  priceAmount: number;
  brand: Types.ObjectId;

  priceId: string | null;
  transactionId: string | null;
  subscriptionId: string | null;
  clientSecret: string | null;
  currentPeriodEnd: Date | null;
  currentPeriodStart: Date | null;
};
