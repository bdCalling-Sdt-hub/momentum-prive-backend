import { model, Schema } from 'mongoose';
import { IPackage } from './package.interface';

const packageSchema = new Schema<IPackage>(
  {
    category: {
      type: String,
      enum: ['Gold', 'Silver', 'Discount'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
    duration: {
      type: String,
      enum: ['Monthly', 'Yearly', 'HaflYearly'],
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

export const Package = model<IPackage>('package', packageSchema);
