import express from 'express';
import User from '../models/userSchema.js';
import Employee from '../models/employeeSchema.js';
import Payment from '../models/paymentSchema.js';
import Leave from '../models/leaveSchema.js';
import Holiday from '../models/holidaySchema.js';
import Attendance from '../models/attendanceSchema.js';
import crypto from "crypto"
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();

// Add Employee
router.post('/', verifyToken, async (req, res) => {
  const userId = req.user.id
  const {
    name, phone, jobRole, email, qualification, designation, department, jobType, salary,
    address, gender, 
  } = req.body;
  try {
    const user = await User.findOne({_id: req.user.id})
    if(!user){
      return res.status(401).json({
        message: "not found",
        status: false
      })
    }

       const uniqueNumber = `RL-${crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase()}`;

    const emailExist = await Employee.findOne({email})
    if(emailExist)return res.status(400).json({message: "email already exist in the employee list"})
    const employee = new Employee({
      adminId: req.user.id, name, phone, jobRole, email, qualification, designation,
      department, jobType, salary,  address, gender, uniqueNumber
    });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});


router.get("/", verifyToken, async(req, res) => {
  const userId = req.user.id

  try {
    const user = await Employee.find({adminId: userId})
    if(!user){
      return res.status(404).json({status: false, message: "not found"})
    }


    return res.status(200).json(user)
  } catch (error) {
    console.log(error)
  }
})

// Edit Employee
router.put('/:id', verifyToken, async (req, res) => {
  const {
    name, phone, jobRole, email, qualification, designation, department, jobType, salary,
    picture, AcctNo, Bank, AcctName, address, gender, complaints
  } = req.body;
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.adminId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    employee.name = name || employee.name;
    employee.phone = phone || employee.phone;
    employee.jobRole = jobRole || employee.jobRole;
    employee.email = email || employee.email;
    employee.qualification = qualification || employee.qualification;
    employee.designation = designation || employee.designation;
    employee.department = department || employee.department;
    employee.jobType = jobType || employee.jobType;
    employee.salary = salary || employee.salary;
    employee.picture = picture || employee.picture;
    employee.AcctNo = AcctNo || employee.AcctNo;
    employee.Bank = Bank || employee.Bank;
    employee.AcctName = AcctName || employee.AcctName;
    employee.address = address || employee.address;
    employee.gender = gender || employee.gender;
    employee.complaints = complaints || employee.complaints;
    await employee.save();
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
   
    const employee = await Employee.findOne({ _id: id, adminId: userId });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found or access denied', status: false });
    }

    // Delete the employee
    await Employee.deleteOne({ _id: id });

    res.status(200).json({ message: 'Employee deleted successfully', status: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message, status: false });
  }
});
// Toggle Dashboard Access
router.patch('/:id/toggle-dashboard', verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.adminId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    employee.dashboardAccess = !employee.dashboardAccess;
    await employee.save();
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set Work Hours and Tasks
router.patch('/:id/work', verifyToken, async (req, res) => {
  const { workHours, tasks } = req.body;
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.adminId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    employee.workHours = workHours || employee.workHours;
    employee.tasks = tasks || employee.tasks;
    await employee.save();
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Employee Login
router.post('/employee-login', async (req, res) => {
  const { uniqueNumber } = req.body;
  try {
    const employee = await Employee.findOne({ uniqueNumber });
    if (!employee) return res.status(400).json({ error: 'Invalid unique number' });
    if (!employee.dashboardAccess) return res.status(403).json({ error: 'Dashboard access disabled' });

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Payment/Payroll
router.post('/:id/payment', verifyToken, async (req, res) => {
  const { amount, paymentDate, payrollPeriod } = req.body;
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.adminId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const payment = new Payment({
      employeeId: req.params.id,
      amount,
      paymentDate,
      payrollPeriod,
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request Leave
router.post('/:id/leave', verifyToken, async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.adminId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const leave = new Leave({
      employeeId: req.params.id,
      startDate,
      endDate,
      reason,
    });
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject Leave
router.patch('/:id/leave/:leaveId', verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    const leave = await Leave.findById(req.params.leaveId);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    if (leave.employeeId.toString() !== req.params.id) return res.status(403).json({ error: 'Invalid request' });

    leave.status = status;
    await leave.save();
    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Holiday
router.post('/holiday',verifyToken, async (req, res) => {
  const { name, description, date } = req.body;
  try {
    const holiday = new Holiday({ name, description, date });
    await holiday.save();
    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record Attendance
router.post('/:id/attendance',verifyToken, async (req, res) => {
  const { date, status, hoursWorked } = req.body;
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.adminId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    // Calculate task effectiveness
    const completedTasks = employee.tasks.filter(task => task.status === 'Completed').length;
    const totalTasks = employee.tasks.length;
    const taskEffectiveness = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const attendance = new Attendance({
      employeeId: req.params.id,
      date,
      status,
      hoursWorked,
      taskEffectiveness,
    });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate Complaint Letter
router.get('/:id/complaint-letter', verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.adminId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const complaintType = employee.complaints;
    if (complaintType === 'none') return res.status(400).json({ error: 'No complaint to generate letter for' });

    const date = new Date().toLocaleDateString();
    let letter = '';

    switch (complaintType) {
      case 'sacked':
        letter = `
          [Company Letterhead]
          Date: ${date}

          To: ${employee.name}
          Address: ${employee.address}

          Subject: Termination of Employment - Sacked

          Dear ${employee.name},

          We regret to inform you that your employment with [Company Name] has been terminated effective immediately due to [specific reason, e.g., repeated misconduct]. This decision was made after careful consideration and in accordance with company policies.

          Please return all company property in your possession by [date]. Your final paycheck, including any outstanding benefits, will be processed and sent to you by [date].

          Should you have any questions, please contact the HR department at [HR contact info].

          Sincerely,
          [Admin Name]
          HR Manager
          [Company Name]
        `;
        break;
      case 'dismissed':
        letter = `
          [Company Letterhead]
          Date: ${date}

          To: ${employee.name}
          Address: ${employee.address}

          Subject: Dismissal Notice

          Dear ${employee.name},

          This letter serves as formal notice of your dismissal from [Company Name], effective [date]. The reason for your dismissal is [specific reason, e.g., violation of company policy]. This action has been taken after a thorough review of the circumstances.

          Please ensure all company property is returned by [date]. Your final payment will be processed by [date].

          For further inquiries, contact HR at [HR contact info].

          Sincerely,
          [Admin Name]
          HR Manager
          [Company Name]
        `;
        break;
      case 'leave':
        letter = `
          [Company Letterhead]
          Date: ${date}

          To: ${employee.name}
          Address: ${employee.address}

          Subject: Leave Approval/Rejection Notice

          Dear ${employee.name},

          We have reviewed your leave request submitted on [submission date]. We are pleased to inform you that your leave from [start date] to [end date] has been [approved/rejected]. [If rejected, include reason, e.g., insufficient notice period].

          Please ensure all pending tasks are delegated before your leave begins. For any questions, contact HR at [HR contact info].

          Sincerely,
          [Admin Name]
          HR Manager
          [Company Name]
        `;
        break;
      case 'suspended':
        letter = `
          [Company Letterhead]
          Date: ${date}

          To: ${employee.name}
          Address: ${employee.address}

          Subject: Suspension Notice

          Dear ${employee.name},

          This letter is to inform you that you have been suspended from your position at [Company Name] effective [start date] for a period of [duration, e.g., 2 weeks]. This action is due to [specific reason, e.g., pending investigation into misconduct].

          During this period, you are not permitted to access company premises or systems. A final decision will be communicated to you by [end date]. For inquiries, contact HR at [HR contact info].

          Sincerely,
          [Admin Name]
          HR Manager
          [Company Name]
        `;
        break;
      default:
        return res.status(400).json({ error: 'Invalid complaint type' });
    }

    res.status(200).json({ letter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Employee Attendance Report
router.get('/:id/attendance-report', verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.adminId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const attendances = await Attendance.find({ employeeId: req.params.id });
    const totalDays = attendances.length;
    const presentDays = attendances.filter(att => att.status === 'Present').length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    const averageTaskEffectiveness = attendances.reduce((sum, att) => sum + att.taskEffectiveness, 0) / (totalDays || 1);

    res.status(200).json({
      attendanceRate,
      averageTaskEffectiveness,
      attendances,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;