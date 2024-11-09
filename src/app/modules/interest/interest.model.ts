import { model, Schema } from 'mongoose';
import { IInterestInfo } from './interest.interface';

const interestInfluencerSchema = new Schema<IInterestInfo>(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    submitProve: {
      type: Schema.Types.ObjectId,
      ref: 'SubmitProve',
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

export const InterestInfluencer = model<IInterestInfo>(
  'InterestInfluencer',
  interestInfluencerSchema
);
