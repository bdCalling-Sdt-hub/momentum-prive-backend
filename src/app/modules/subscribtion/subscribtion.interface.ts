import { Types } from 'mongoose';
export type ISubscribtion = {
  customerId: string;
  plan: string;
  status: 'expired' | 'active' | 'incomplete' | 'cancellation_requested';
  priceAmount: number;
  user: Types.ObjectId;
  packages: Types.ObjectId;

  priceId: string | null;
  transactionId: string | null;
  subscriptionId: string | null;
  clientSecret: string | null;
  currentPeriodEnd: Date | null;
  currentPeriodStart: Date | null;
};
