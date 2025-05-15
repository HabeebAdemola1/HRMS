

import mongoose from 'mongoose';


const AttendanceSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  date: { type: Date, required: true },
  signInTime: { type: Date },
  signOutTime: { type: Date },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Absent' },
  hoursWorked: { type: Number, default: 0 },
  taskEffectiveness: { type: Number, min: 0, max: 100, default: 0 }, 
  createdAt: { type: Date, default: Date.now },
}, {

  indexes: [{ key: { employeeId: 1, date: 1 }, unique: true }]
});


const WorkScheduleSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  standardStartTime: { type: String, default: '09:00' }, 
  workDaysPerWeek: {
    permanent: { type: Number, default: 5 },
    hybrid: { type: Number, default: 3 },
    remote: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});


AttendanceSchema.pre('save', async function (next) {
  if (this.signInTime && this.signOutTime) {
 
    const hours = (this.signOutTime - this.signInTime) / (1000 * 60 * 60);
    this.hoursWorked = Math.max(0, Math.round(hours * 100) / 100);

    const workSchedule = await mongoose.model('WorkSchedule').findOne();
    if (workSchedule) {
      const [startHour, startMinute] = workSchedule.standardStartTime.split(':').map(Number);
      const startTime = new Date(this.date);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      if (this.signInTime > startTime) {
        this.status = 'Late';
      } else {
        this.status = 'Present';
      }
    }
  }
  next();
});


const PaymentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grossSalary: { type: Number, required: true },
  tax: {
    percentage: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  IOU: {
    percentage: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  penalty: {
    percentage: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  otherDeduction: {
    percentage: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  totalDeductions: {
    type:Number,
    default: 0
  },
  netSalary: { type: Number },
  dailySalary: { type: Number },
  monthlySalary: { type: Number },
  yearlySalary: { type: Number },
  paymentDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  payrollPeriod: { type: String, required: true },
  isFullMonth: { type: Boolean, default: true },
  attendanceCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save middleware for Payment
PaymentSchema.pre('save', async function (next) {
  const Employee = mongoose.model('Employee');
  const Attendance = mongoose.model('Attendance');
  const WorkSchedule = mongoose.model('WorkSchedule');

  // Fetch employee and work schedule
  const employee = await Employee.findById(this.employeeId);
  const workSchedule = await WorkSchedule.findOne();

  if (!employee || !workSchedule) {
    return next(new Error('Employee or work schedule not found'));
  }


  const [startDate, endDate] = this.payrollPeriod.split('-').map(date => new Date(date));
  const attendanceRecords = await Attendance.find({
    employeeId: this.employeeId,
    date: { $gte: startDate, $lte: endDate },
    status: { $in: ['Present', 'Late'] }
  });

  this.attendanceCount = attendanceRecords.length;


  let dailySalary = employee.baseMonthlySalary / (workSchedule.workDaysPerWeek.permanent * 4);
  
  switch (employee.jobType) {
    case 'Permanent':
    case 'Hybrid':
   
      this.grossSalary = dailySalary * this.attendanceCount;
      break;
    case 'Remote':
    
      this.grossSalary = employee.baseMonthlySalary;
      this.attendanceCount = 0; 
      break;
    default:
      return next(new Error('Invalid job type'));
  }

  // Calculate deductions
  this.tax.amount = this.tax.percentage 
    ? (this.grossSalary * this.tax.percentage) / 100 
    : this.tax.amount;
  
  this.IOU.amount = this.IOU.percentage 
    ? (this.grossSalary * this.IOU.percentage) / 100 
    : this.IOU.amount;
  
  this.penalty.amount = this.penalty.percentage 
    ? (this.grossSalary * this.penalty.percentage) / 100 
    : this.penalty.amount;
  
  this.otherDeduction.amount = this.otherDeduction.percentage 
    ? (this.grossSalary * this.otherDeduction.percentage) / 100 
    : this.otherDeduction.amount;

  // Calculate net salary
  this.netSalary = this.grossSalary - (
    this.tax.amount + 
    this.IOU.amount + 
    this.penalty.amount + 
    this.otherDeduction.amount
  );

  // Calculate salary breakdowns
  this.dailySalary = dailySalary;
  this.monthlySalary = this.grossSalary;
  this.yearlySalary = this.grossSalary * 12;

  next();
});

// Export models
export const Payment = mongoose.model('Payment', PaymentSchema);
export const Attendance = mongoose.model('Attendance', AttendanceSchema);
export const WorkSchedule = mongoose.model('WorkSchedule', WorkScheduleSchema);