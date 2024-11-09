import { model, Schema } from 'mongoose';
import { IShowInterest } from './showInterest.interface';
import { status } from './showInterest.constant';

const showInterestSchema = new Schema<IShowInterest>(
  {
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    status: {
      type: String,
      enum: status,
      default: 'Pending',
    },
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    // },
  },
  {
    timestamps: true,
  }
);

export const ShowInterest = model<IShowInterest>(
  'ShowInterest',
  showInterestSchema
);
