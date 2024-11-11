import { model, Schema } from 'mongoose';
import { IBrand } from './brand.interface';

const brandSchema = new Schema<IBrand>(
  {
    address: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    city: {
      type: String,
    },
    code: {
      type: String,
    },
    country: {
      type: String,
    },
    email: {
      type: String,
      // default: null,
    },
    image: {
      type: String,
    },

    owner: {
      type: String,
    },
    phnNum: {
      type: String,
    },
    whatAppNum: {
      type: String,
    },
    manager: {
      type: String,
    },
    instagram: {
      type: String,
    },
    tiktok: {
      type: String,
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

export const Brand = model<IBrand>('Brand', brandSchema);
