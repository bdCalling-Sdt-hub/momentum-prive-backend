import { model, Schema } from 'mongoose';
import { IRequirement } from './requirement.interface';

const requirementSchema = new Schema<IRequirement>(
  {
    option1: {
      type: String,
      required: true,
    },
    option2: {
      type: String,
      required: true,
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

export const Requirement = model<IRequirement>(
  'requirement',
  requirementSchema
);
