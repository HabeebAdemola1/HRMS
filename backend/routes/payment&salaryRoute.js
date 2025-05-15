import express from 'express';
import mongoose from 'mongoose';
import { Attendance, Payment, WorkSchedule } from '../models/paymentSchema.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Create Attendance Record
router.post('/attendance', verifyToken, async (req, res) => {
  try {
    const { employeeId, employeeName, date, signInTime, signOutTime, taskEffectiveness } = req.body;
    
    const attendance = new Attendance({
      adminId: req.user.id, 
      employeeId,
      employeeName,
      date: new Date(date),
      signInTime: signInTime ? new Date(signInTime) : undefined,
      signOutTime: signOutTime ? new Date(signOutTime) : undefined,
      taskEffectiveness,
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance recorded', attendance });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Attendance already recorded for this employee on this date' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update Attendance Record
router.put('/attendance/:id', verifyToken, async (req, res) => {
  try {
    const { signInTime, signOutTime, taskEffectiveness } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    attendance.signInTime = signInTime ? new Date(signInTime) : attendance.signInTime;
    attendance.signOutTime = signOutTime ? new Date(signOutTime) : attendance.signOutTime;
    attendance.taskEffectiveness = taskEffectiveness !== undefined ? taskEffectiveness : attendance.taskEffectiveness;

    await attendance.save();
    res.json({ message: 'Attendance updated', attendance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Attendance Record
router.delete('/attendance/:id', verifyToken, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Attendance Records
router.get('/attendance', verifyToken, async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const query = {};

    if (employeeId) query.employeeId = employeeId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendances = await Attendance.find(query)
      .populate('employeeId', 'name jobType')
      .sort({ date: -1 });
    res.json(attendances);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Single Attendance Record
router.get('/attendance/:id', verifyToken, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employeeId', 'name jobType');
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create Payment Record
router.post('/payment', verifyToken, async (req, res) => {
  try {
    const { employeeId, grossSalary, paymentDate, payrollPeriod, isFullMonth, tax, IOU, penalty, otherDeduction } = req.body;


    const deductions = [
      { name: 'tax', value: tax },
      { name: 'IOU', value: IOU },
      { name: 'penalty', value: penalty },
      { name: 'otherDeduction', value: otherDeduction },
    ];
    for (const deduction of deductions) {
      if (!deduction.value || !['percentage', 'amount'].includes(deduction.value.mode)) {
        return res.status(400).json({
          status: false,
          message: `Valid ${deduction.name} object with mode (percentage or amount) is required`,
        });
      }
      if (isNaN(deduction.value.percentage) || isNaN(deduction.value.amount)) {
        return res.status(400).json({
          status: false,
          message: `${deduction.name} percentage and amount must be numbers`,
        });
      }
    }

        // Calculate totalDeductions
        const calculateDeduction = (deduction, grossSalary) => {
          const { mode, percentage, amount } = deduction;
          return mode === 'percentage' ? (grossSalary * percentage) / 100 : amount;
        };


    const totalDeductions =
    calculateDeduction(tax || { percentage: 0, amount: 0, mode: 'percentage' }, grossSalary) +
    calculateDeduction(IOU || { percentage: 0, amount: 0, mode: 'percentage' }, grossSalary) +
    calculateDeduction(penalty || { percentage: 0, amount: 0, mode: 'percentage' }, grossSalary) +
    calculateDeduction(otherDeduction || { percentage: 0, amount: 0, mode: 'percentage' }, grossSalary) 

    
    const payment = new Payment({
      adminId: req.user.id,
      employeeId,
      grossSalary,
      paymentDate: new Date(paymentDate),
      payrollPeriod,
      isFullMonth,
      tax: tax || { percentage: 0, amount: 0 },
      IOU: IOU || { percentage: 0, amount: 0 },
      penalty: penalty || { percentage: 0, amount: 0 },
      otherDeduction: otherDeduction || { percentage: 0, amount: 0 },
      totalDeductions
    });

    await payment.save();
    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message });
  }
});

// Update Payment Record
router.put('/payment/:id', verifyToken, async (req, res) => {
  try {
    const { grossSalary, paymentDate, payrollPeriod, isFullMonth, tax, IOU, penalty, otherDeduction, status } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    payment.grossSalary = grossSalary || payment.grossSalary;
    payment.paymentDate = paymentDate ? new Date(paymentDate) : payment.paymentDate;
    payment.payrollPeriod = payrollPeriod || payment.payrollPeriod;
    payment.isFullMonth = isFullMonth !== undefined ? isFullMonth : payment.isFullMonth;
    payment.tax = tax || payment.tax;
    payment.IOU = IOU || payment.IOU;
    payment.penalty = penalty || payment.penalty;
    payment.otherDeduction = otherDeduction || payment.otherDeduction;
    payment.status = status || payment.status;

    await payment.save();
    res.json({ message: 'Payment updated', payment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Payment Record
router.delete('/payment/:id', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    res.json({ message: 'Payment record deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Payment Records
router.get('/payment', verifyToken, async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const query = {};

    if (employeeId) query.employeeId = employeeId;
    if (startDate && endDate) {
      query.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const payments = await Payment.find(query)
      .populate('employeeId', 'name jobType')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Single Payment Record
router.get('/payment/:id', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('employeeId', 'name jobType');
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create/Update Work Schedule
router.post('/work-schedule', verifyToken, async (req, res) => {
  try {
    const { companyId, standardStartTime, workDaysPerWeek } = req.body;
    
    const workSchedule = await WorkSchedule.findOneAndUpdate(
      { companyId },
      {
        companyId,
        standardStartTime,
        workDaysPerWeek: workDaysPerWeek || {
          permanent: 5,
          hybrid: 3,
          remote: 0,
        },
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Work schedule saved', workSchedule });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Work Schedule
router.get('/work-schedule', verifyToken, async (req, res) => {
  try {
    const workSchedule = await WorkSchedule.findOne();
    if (!workSchedule) {
      return res.status(404).json({ error: 'Work schedule not found' });
    }
    res.json(workSchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;









