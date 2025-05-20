import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
  adminId:{type:mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String,  },
  startDate: { type: Date,  },
  endDate: { type: Date,  },
  reason: { type: String,  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Leave', LeaveSchema);