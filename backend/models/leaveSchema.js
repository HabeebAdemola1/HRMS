import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
  adminId:{type:mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Leave', LeaveSchema);