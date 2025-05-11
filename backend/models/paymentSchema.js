import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, 
  tax: { type: Number, default: 0 }, 
  IOU: { type: Number, default: 0 }, 
  penalty: { type: Number, default: 0 }, 
  netSalary: { type: Number }, 
  dailySalary: { type: Number }, 
  monthlySalary: { type: Number }, 
  yearlySalary: { type: Number }, 
  paymentDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  payrollPeriod: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

PaymentSchema.pre('save', async function (next) {
 
  this.netSalary = this.amount - (this.tax + this.IOU + this.penalty);


  this.dailySalary = this.amount / 30;
  this.monthlySalary = this.amount; 
  this.yearlySalary = this.monthlySalary * 12; 

  next();
});

export default mongoose.model('Payment', PaymentSchema);