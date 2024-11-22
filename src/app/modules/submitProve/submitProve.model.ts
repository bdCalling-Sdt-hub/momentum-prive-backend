import { model, Schema } from 'mongoose';
import { ISubmitProve } from './submitProve.interface';
import { inviteStatus } from '../collaboration/collaboration.constant';

const submitProveSchema = new Schema<ISubmitProve>(
  {
    track: {
      type: Schema.Types.ObjectId,
      ref: 'Track',
    },
    image: {
      type: [String],
    },
    instagram: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    tiktok: {
      type: String,
    },
    categoryName: {
      type: String,
    },
    typeStatus: {
      type: String,
      enum: inviteStatus,
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

submitProveSchema.pre('save', function (next) {
  if (this.typeStatus === 'Pending') {
    this.typeStatus = 'Review';
  }
  next();
});

export const SubmitProve = model<ISubmitProve>(
  'SubmitProve',
  submitProveSchema
);
