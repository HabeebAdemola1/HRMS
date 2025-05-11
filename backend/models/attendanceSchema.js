import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  adminId:{type:mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Absent' },
  hoursWorked: { type: Number, default: 0 },
  taskEffectiveness: { type: Number, default: 0 }, // Percentage (0-100)
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Attendance', AttendanceSchema);