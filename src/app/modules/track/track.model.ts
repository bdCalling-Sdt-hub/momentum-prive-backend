import { model, Schema } from 'mongoose';
import { ITrack } from './track.interface';

const inviteSchema = new Schema<ITrack>(
  {
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Track = model<ITrack>('Track', inviteSchema);
