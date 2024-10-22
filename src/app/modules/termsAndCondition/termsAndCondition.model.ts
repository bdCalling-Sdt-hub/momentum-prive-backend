import { model, Schema } from 'mongoose';
import { ITermsAndCondition } from './termsAndCondition.interface';

const termAndConditionSchema = new Schema<ITermsAndCondition>(
  {
    details: {
      type: String,
      required: true,
      trim: true,
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

export const Terms = model<ITermsAndCondition>(
  'termsandcondition',
  termAndConditionSchema
);
