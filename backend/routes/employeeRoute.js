import express from 'express';
import User from '../models/userSchema.js';
import Admin from '../models/userSchema.js';
import Employee from '../models/employeeSchema.js';
import { Payment } from '../models/paymentSchema.js';
// import Payment from '../models/paymentSchema.js';
import Leave from '../models/leaveSchema.js';
import Holiday from '../models/holidaySchema.js';
import { Attendance } from '../models/paymentSchema.js';
import nodemailer from "nodemailer";

import crypto from "crypto"
import { verifyToken } from '../middleware/verifyToken.js';
import jwt  from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router();

// Add Employee
router.post('/', verifyToken, async (req, res) => {
  const userId = req.user.id
  const {
    name, phone, jobRole, email, qualification, designation, department, jobType, salary,
    address, gender,
  } = req.body;
  try {
    const user = await User.findOne({ _id: req.user.id })
    if (!user) {
      return res.status(401).json({
        message: "not found",
        status: false
      })
    }

    const uniqueNumber = `RL-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const emailExist = await Employee.findOne({ email })
    if (emailExist) return res.status(400).json({ message: "email already exist in the employee list" })
    const employee = new Employee({
      adminId: req.user.id, name, phone, jobRole, email, qualification, designation,
      department, jobType, salary, address, gender, uniqueNumber
    });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});


router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id

  try {
    const user = await Employee.find({ adminId: userId })
    if (!user) {
      return res.status(404).json({ status: false, message: "not found" })
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
router.patch('/toggle-dashboard', verifyToken, async (req, res) => {
  console.log("the token", req.user.id)
  const userId = req.user?.id
  try {
    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(404).json({
        message: "user not found",
        status: "false"
      })
    }
    const employeeAdmin = await Employee.findOne({adminId: user._id})
    if(!employeeAdmin){
      return res.status(400).json({
        message: "admin details is not found in employee table",
        status: false
      })
    }


    if( employeeAdmin.dashboardAccess){
      return res.status(400).json({
        message: "dashboard access is  already enabled"
      })
    }

    employeeAdmin.dashboardAccess = true

    await employeeAdmin.save()
    
    return res.status(200).json({
      message: 'Dashboard access enabled successfully',
      status: true,
    })

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
// router.post('/employee-login', async (req, res) => {
//   const { uniqueNumber } = req.body;

//   console.log('Employee-login: Received uniqueNumber:', uniqueNumber);
//   try {
//     const employee = await Employee.findOne({ uniqueNumber });
//     if (!employee) return res.status(400).json({ message: 'Invalid unique number' });
//     // if (!employee.dashboardAccess) return res.status(403).json({ message: 'Dashboard access disabled' });


//     const token = jwt.sign({id: employee._id, }, process.env.JWT_SECRET, { expiresIn: '1h' })
//     res.status(200).json({message: `successfully logged in as ${employee.name}`,employee, token});
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

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
router.post('/holiday', verifyToken, async (req, res) => {
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
router.post('/:id/attendance', verifyToken, async (req, res) => {
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


// router.get("/employeedashboard", verifyToken, async(req, res) => {
// const userId = req.user.id
//   try {
//     const employee = await Employee.findOne({_id: userId}).populate("adminId", "name email phoneNumber")
//     if(!employee){
//       return res.status(400).json({message: "employee not found"})
//     }
//        if (!employee && req.query.uniqueNumber) {
//       const uniqueNumber = req.query.uniqueNumber.toString().trim();
//       console.log('employeedashboard: Using uniqueNumber:', uniqueNumber);
//       employee = await Employee.findOne({ uniqueNumber })
//         .populate('adminId', 'name email phoneNumber')
//         .lean();
//     }

//     return res.status(200).json({employee})
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({message: "an error occurreed"})
//   }
// })


// router.get("/employeepayment", verifyToken, async(req, res) => {
//   const userId = req.user.id
//   try {
//      const employee = await Employee.findOne({_id: userId}).populate("adminId", "name email phoneNumber")
//     if(!employee){
//       return res.status(400).json({message: "employee not found"})
//     }
//        if (!employee && req.query.uniqueNumber) {
//       const uniqueNumber = req.query.uniqueNumber.toString().trim();
//       console.log('employeedashboard: Using uniqueNumber:', uniqueNumber);
//       employee = await Employee.findOne({ uniqueNumber })
//         .populate('adminId', 'name email phoneNumber')
//         .lean();
//     }
//     const payment = await Payment.findOne({_id: userId}).populate("adminId", "name email phoneNumber")
//     if(!payment && req.query.uniqueNumber){
//         const uniqueNumber = req.query.uniqueNumber.toString().trim();
//       console.log('employeedashboard: Using uniqueNumber:', uniqueNumber);
//       payment = await Payment.findOne({ uniqueNumber })
//         .populate('adminId', 'name email phoneNumber')
//         .lean();
   
//     }

//     return res.status(200).json({payment})
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({message: "an error occurred from the server"})
//   }
// })





// Employee dashboard route
router.get('/employeedashboard', verifyToken, async (req, res) => {
  try {
    console.log('employeedashboard: Query params:', req.query);
    if (req.user.role !== 'employee') {
      console.log('employeedashboard: Access denied for non-employee role:', req.user.role);
      return res.status(403).json({ message: 'Forbidden: Employee access required' });
    }

    let employee = await Employee.findById(req.user.id)
      .populate('adminId', 'name email phoneNumber')
      .lean();

    if (!employee) {
      const uniqueNumber = req.query.uniqueNumber || req.user.uniqueNumber;
      if (uniqueNumber) {
        console.log('employeedashboard: Using uniqueNumber:', uniqueNumber);
        employee = await Employee.findOne({ uniqueNumber })
          .populate('adminId', 'name email phoneNumber')
          .lean();
      }
    }

    if (!employee) {
      console.log('employeedashboard: Employee not found for ID:', req.user.id, 'or uniqueNumber:', req.query.uniqueNumber || req.user.uniqueNumber);
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log('employeedashboard: Found employee:', employee);
    return res.status(200).json({ employee });
  } catch (error) {
    console.error('employeedashboard: Error:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: 'An error occurred' });
  }
});

// Employee payment route
router.get('/employeepayment', verifyToken, async (req, res) => {
  try {
    console.log('employeepayment: Query params:', req.query);
    if (req.user.role !== 'employee') {
      console.log('employeepayment: Access denied for non-employee role:', req.user.role);
      return res.status(403).json({ message: 'Forbidden: Employee access required' });
    }

    const employee = await Employee.findById(req.user.id).select('_id uniqueNumber').lean();
    if (!employee) {
      console.log('employeepayment: Employee not found for ID:', req.user.id);
      return res.status(404).json({ message: 'Employee not found' });
    }

    const payments = await Payment.find({ employeeId: req.user.id })
      .sort({ paymentDate: -1 })
      .lean();

    console.log('employeepayment: Found payments:', payments.length, 'for employee:', employee.uniqueNumber);
    return res.status(200).json({ payment: payments });
  } catch (error) {
    console.error('employeepayment: Error:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: 'An error occurred' });
  }
});


router.post("/applyforleave", verifyToken, async(req, res) => {
  const {letter} = req.body
  try {
     console.log('employeepayment: Query params:', req.query);
    if (req.user.role !== 'employee') {
      console.log('employeepayment: Access denied for non-employee role:', req.user.role);
      return res.status(403).json({ message: 'Forbidden: Employee access required' });
    }

    
    const employee = await Employee.findById(req.user.id).select('_id uniqueNumber').lean();
    if (!employee) {
      console.log('employeepayment: Employee not found for ID:', req.user.id);
      return res.status(404).json({ message: 'Employee not found' });
    }

    const leave = new Leave({
      adminId: employee.adminId,
      employeeName:employee.name,
      letter,

    })

    
    return res.status(201).json({message: "successful created",leave})
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "an error occcured"})
  }
})

router.get("/getleaveletter", verifyToken, async (req, res) => {
  try {
    console.log('getleaveletter: Starting for user:', req.user.id);

    // Fetch employee
    const employee = await Employee.findById(req.user.id).lean();
    if (!employee) {
      console.log('getleaveletter: Employee not found for ID:', req.user.id);
      return res.status(404).json({ message: 'Employee not found' });
    }
    console.log('getleaveletter: Employee found:', employee.name);

    // Fetch admin
    const admin = await User.findById(employee.adminId).lean();
    if (!admin) {
      console.log('getleaveletter: Admin not found for ID:', employee.adminId);
      return res.status(400).json({ message: 'Admin data not found' });
    }
    console.log('getleaveletter: Admin found:', admin.name);

    // Hardcoded leave data (replace with LeaveRequest query in dynamic version)
    const leaveData = {
      type: 'leave',
      submissionDate: new Date('2025-05-10'),
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-05'),
      status: 'approved',
      rejectionReason: '',
      hrContact: 'hr@example.com',
    };

    // Generate current date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate letter
    let letter = '';
    if (leaveData.type === 'leave') {
      letter = `
${admin.name}
Date: ${currentDate}

To: ${employee.name}
Address: ${employee.address || 'Not provided'}

Subject: Appeal for a Leave

Dear ${employee.name},

We have reviewed your leave request submitted on ${leaveData.submissionDate.toLocaleDateString('en-US')}. 
We are pleased to inform you that your leave from ${leaveData.startDate.toLocaleDateString('en-US')} to ${leaveData.endDate.toLocaleDateString('en-US')} has been ${leaveData.status}.
${leaveData.status === 'rejected' ? `Reason: ${leaveData.rejectionReason}` : ''}

Please ensure all pending tasks are delegated before your leave begins. For any questions, contact HR at ${leaveData.hrContact}.

Sincerely,
${admin.name}
HR Manager
${admin.name}
      `;
    } else {
      console.log('getleaveletter: Invalid leave type:', leaveData.type);
      return res.status(400).json({ message: 'Invalid leave type' });
    }

    console.log('getleaveletter: Generated letter:\n', letter);
    res.status(200).json({ letter });
  } catch (error) {
    console.error('getleaveletter: Error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
});





// Employee login (for completeness)
router.post('/employee-login', async (req, res) => {
  let { uniqueNumber } = req.body;
  uniqueNumber = uniqueNumber?.toString().trim();
  if (!uniqueNumber) {
    return res.status(400).json({ message: 'uniqueNumber is required' });
  }

  try {
    const employee = await Employee.findOne({ 
      uniqueNumber: { $regex: `^${uniqueNumber}$`, $options: 'i' }
    });
    if (!employee) {
      return res.status(400).json({ message: 'Invalid unique number' });
    }
 

    const token = jwt.sign({ id: employee._id, role: 'employee' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ 
      message: `Successfully logged in as ${employee.name}`, 
      employee, 
      token 
    });
  } catch (error) {
    console.error('employee-login: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});







router.get('/:id/complaint-letter', verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.adminId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const admin = await Admin.findById(employee.adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });


    const validComplaints = [
      "pay-slip",
      "employment",
      "query",
      "promotion",
      "suspended", 
      "sacked",
       "dismissed",
    ]


    let complaintType;

    
    const frontendComplaint = req.body?.complaintType || req.query?.complaintType || null;

    if(employee.complaints && validComplaints.includes(employee.complaints)){
      complaintType = employee.complaints
    } else if(frontendComplaint && validComplaints.includes(frontendComplaint)){
      complaintType = frontendComplaint
    } else {
      return res.status(400).json({ error: 'Invalid complaint type. Please select a valid complaint.' });
    }


    if (complaintType === 'none of the above') return res.status(400).json({ error: 'No complaint to generate letter for' });

    const date = new Date().toLocaleDateString();
    let letter = '';

    switch (complaintType) {
      case 'sacked':
        letter = `
${admin.name}
Date: ${date}

To: ${employee.name}
Address: ${employee.address}

Subject: Termination of Employment - Sacked

Dear ${employee.name},

We regret to inform you that your employment with ${admin.name} has been terminated effective immediately due to [specific reason, e.g., repeated misconduct]. This decision was made after careful consideration and in accordance with company policies.

Please return all company property in your possession by [date]. Your final paycheck, including any outstanding benefits, will be processed and sent to you by [date].

Should you have any questions, please contact the HR department at [HR contact info].

Sincerely,
${admin.name}
HR Manager
${admin.name}
        `;
        break;
      case 'promotion':
        letter = `
${admin.name}
Date: ${date}

To: ${employee.name}
Address: ${employee.address}

Subject: Promotion Announcement

Dear ${employee.name},

We are pleased to inform you that you have been promoted to [new position, e.g., Senior Developer] at ${admin.name}, effective [start date]. This promotion is in recognition of your outstanding performance and contributions to the company.

Your new role will include [brief description of new responsibilities]. Your updated compensation package will be detailed in a separate document sent by [date].

Please contact HR at [HR contact info] for any questions or to discuss the transition.

Sincerely,
${admin.name}
HR Manager
${admin.name}
        `;
        break;
      case 'pay-slip':
        letter = `
${admin.name}
Date: ${date}

To: ${employee.name}
Address: ${employee.address}

Subject: Payslip Discrepancy Notice

Dear ${employee.name},

We have received your query regarding a discrepancy in your payslip for [month/year]. After review, [explain resolution, e.g., an error in overtime calculation has been identified and corrected]. A corrected payslip will be issued by [date].

Please review the updated payslip and contact HR at [HR contact info] if you have further concerns.

Sincerely,
${admin.name}
HR Manager
${admin.name}
        `;
        break;
      case 'employment':
        letter = `
${admin.name}
Date: ${date}

To: ${employee.name}
Address: ${employee.address}

Subject: Employment Confirmation

Dear ${employee.name},

We are delighted to confirm your employment with ${admin.name} as [position, e.g., Software Engineer], effective [start date]. Your role will involve [brief description of duties].

Your compensation package and employment terms are outlined in the attached contract. Please sign and return the contract by [date]. For any questions, contact HR at [HR contact info].

Sincerely,
${admin.name}
HR Manager
${admin.name}
        `;
        break;
      case 'query':
        letter = `
${admin.name}
Date: ${date}

To: ${employee.name}
Address: ${employee.address}

Subject: Response to Employee Query

Dear ${employee.name},

We have received your query submitted on [submission date] regarding [query topic, e.g., workplace policy]. After review, [explain resolution, e.g., the policy has been clarified as follows: ...].

Please contact HR at [HR contact info] if you have additional questions or require further clarification.

Sincerely,
${admin.name}
HR Manager
${admin.name}
        `;
        break;
      case 'dismissed':
        letter = `
${admin.name}
Date: ${date}

To: ${employee.name}
Address: ${employee.address}

Subject: Dismissal Notice

Dear ${employee.name},

This letter serves as formal notice of your dismissal from ${admin.name}, effective [date]. The reason for your dismissal is [specific reason, e.g., violation of company policy]. This action has been taken after a thorough review of the circumstances.

Please ensure all company property is returned by [date]. Your final payment will be processed by [date].

For further inquiries, contact HR at [HR contact info].

Sincerely,
${admin.name}
HR Manager
${admin.name}
        `;
        break;
      case 'leave':
        letter = `
${admin.name}
Date: ${date}

To: ${employee.name}
Address: ${employee.address}

Subject: Leave Approval/Rejection Notice

Dear ${employee.name},

We have reviewed your leave request submitted on [submission date]. We are pleased to inform you that your leave from [start date] to [end date] has been [approved/rejected]. [If rejected, include reason, e.g., insufficient notice period].

Please ensure all pending tasks are delegated before your leave begins. For any questions, contact HR at [HR contact info].

Sincerely,
${admin.name}
HR Manager
${admin.name}
        `;
        break;
      case 'suspended':
        letter = `
${admin.name}
Date: ${date}

To: ${employee.name}
Address: ${employee.address}

Subject: Suspension Notice

Dear ${employee.name},

This letter is to inform you that you have been suspended from your position at ${admin.name} effective [start date] for a period of [duration, e.g., 2 weeks]. This action is due to [specific reason, e.g., pending investigation into misconduct].

During this period, you are not permitted to access company premises or systems. A final decision will be communicated to you by [end date]. For inquiries, contact HR at [HR contact info].

Sincerely,
${admin.name}
HR Manager
${admin.name}
        `;
        break;
      default:
        return res.status(400).json({ error: 'Invalid complaint type' });
    }

    res.status(200).json({ letter });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});







router.post('/:id/send-letter', async (req, res) => {
  const { id } = req.params;
  const { letter, complaintType } = req.body;

  try {

    const employee = await Employee.findById(id);
    if (!employee) {
      console.log('employee not found')
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Configure email transport (e.g., Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: employee.email,
      subject: `Complaint Letter: ${complaintType}`,
      text: letter,
    });

    res.json({ message: 'Letter sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send letter' });
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







