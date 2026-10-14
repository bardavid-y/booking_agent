import mongoose, { Schema, model, models } from 'mongoose';

const CustomerSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    idNumber: {
      type: String, // Passport or National ID
      trim: true,
    },
  },
  { timestamps: true }
);

export default models.Customer || model('Customer', CustomerSchema);