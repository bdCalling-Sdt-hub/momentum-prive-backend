import { model, Schema } from 'mongoose';
import { IInterest } from './interest.interface';

const interestSchema = new Schema<IInterest>(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'Influencer',
    },
    Collaborate: {
      type: Schema.Types.ObjectId,
      ref: 'Collaborate',
    },

    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Interest = model<IInterest>('interest_influencer', interestSchema);
