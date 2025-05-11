import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  jobRole: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  qualification: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  jobType: { type: String, required: true },
  salary: { type: String, required: true },
  picture: { type: String },
  AcctNo:{type:String, },
  Bank:{type:String, },
  AcctName: {type:String, },
  address:{type:String, required: true},
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  complaints:{type:String, enum: ["suspended", "sacked", "dismissed", "serviceNoLongerRequired", "none"], default:"none" },
  uniqueNumber: { type: String, unique: true },
  dashboardAccess: { type: Boolean, default: true },
  workHours: { type: Number },
  tasks: [{ description: String, deadline: Date, status: { type: String, default: 'Pending' } }],
  createdAt: { type: Date, default: Date.now },
});

EmployeeSchema.pre('save', async function (next) {
  if (!this.uniqueNumber) {
    this.uniqueNumber = `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export default mongoose.model('Employee', EmployeeSchema);