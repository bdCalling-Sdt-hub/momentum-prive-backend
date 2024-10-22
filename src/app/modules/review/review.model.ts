import { model, Schema } from 'mongoose';
import { IReview } from './review.interface';

const reviewSchema = new Schema<IReview>(
  {
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'Influencer',
      required: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const Review = model<IReview>('review', reviewSchema);
