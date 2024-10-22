import { Types } from 'mongoose';
export type ISubscribtion = {
  customerId: string;
  plan: string;
  // subscriptionId: string;
  status: string;
  priceAmount: number;
  brand: Types.ObjectId;

  priceId: string | null; // Allow priceId to be null
  transactionId: string | null; // Allow transactionId to be null
  subscriptionId: string | null; // Allow subscriptionId to be null
  clientSecret: string | null;
  currentPeriodEnd: string | null;
  currentPeriodStart: string | null;
};
