import mongoose from 'mongoose';

const MaintenanceTicketSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
    },
    issue: {
      type: String,
      required: [true, 'Issue description is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Normal',
    },
    outOfOrder: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
  },
  { timestamps: true } // This automatically adds createdAt and updatedAt
);

export default mongoose.models.MaintenanceTicket || mongoose.model('MaintenanceTicket', MaintenanceTicketSchema);