import mongoose, { Schema, model, models } from 'mongoose';

const RoomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      enum: ['Standard', 'Deluxe', 'Suite'],
      default: 'Standard',
    },
    capacity: {
      type: Number,
      default: 2,
      min: 1,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Maintenance'],
      default: 'Available',
    },
    amenities: {
      type: [String],
      default: ['Wi-Fi', 'TV', 'Air Conditioning'],
    },
  },
  { timestamps: true }
);

export default models.Room || model('Room', RoomSchema);