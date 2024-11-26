import { model, Schema } from 'mongoose';
import { IPackage } from './package.interface';

const packageSchema = new Schema<IPackage>(
  {
    category: {
      type: String,
      enum: ['Monthly', 'HalfYearly', 'Yearly'],
      required: true,
    },
    title: {
      type: String,
      enum: ['Gold', 'Silver', 'Discount'],
      required: true,
    },
    // duration: {
    //   type: String,
    //   enum: ['Monthly', 'Yearly', 'HalfYearly'],
    //   required: true,
    // },
    limit: {
      type: String,
    },
    productId: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Package = model<IPackage>('Package', packageSchema);
