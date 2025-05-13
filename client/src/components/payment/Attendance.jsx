// import { useEffect, useState } from "react";
// import axios from "axios";
// import moment from "moment";

// const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

// const getAuthHeader = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// });

// const AttendanceManagement = () => {
//   const [attendances, setAttendances] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [resumeTime, setResumeTime] = useState("09:00"); // Default resume time
//   const [newResumeTime, setNewResumeTime] = useState(resumeTime);
//   const [form, setForm] = useState({
//     employeeId: '',
//     employeeName: '',
//     date: moment().format('YYYY-MM-DD'),
//     signInTime: moment().format('HH:mm'),
//     signOutTime: '',
//     taskEffectiveness: 0,
//     status: 'Present',
//   });
//   const [editingId, setEditingId] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     fetchAttendances();
//     fetchEmployees();
//     fetchResumeTime();
//   }, []);

//   const fetchAttendances = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}/attendance`, getAuthHeader());
//       setAttendances(res.data || []);
//       setError('');
//     } catch (error) {
//       setError('Failed to fetch attendances. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}/employees`, getAuthHeader());
//       setEmployees(res.data || []);
//       setError('');
//     } catch (error) {
//       setError('Failed to fetch employees. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchResumeTime = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/work-schedule`, getAuthHeader());
//       setResumeTime(res.data?.resumeTime || "09:00");
//       setNewResumeTime(res.data?.resumeTime || "09:00");
//     } catch (error) {
//       setError('Failed to fetch resume time. Using default 09:00.');
//     }
//   };

//   const checkDuplicateAttendance = async (employeeId, date, excludeId = null) => {
//     try {
//       const res = await axios.get(
//         `${API_BASE_URL}/attendance?employeeId=${employeeId}&date=${date}`,
//         getAuthHeader()
//       );
//       const existing = res.data || [];
//       return existing.some(att => att._id !== excludeId);
//     } catch (error) {
//       setError('Failed to check for existing attendance. Please try again.');
//       return false;
//     }
//   };

//   const handleResumeTimeChange = (e) => {
//     setNewResumeTime(e.target.value);
//   };

//   const handleResumeTimeSubmit = async () => {
//     if (!newResumeTime || !/^[0-2][0-9]:[0-5][0-9]$/.test(newResumeTime)) {
//       setError('Please enter a valid time (HH:mm).');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await axios.post(
//         `${API_BASE_URL}/work-schedule`,
//         { resumeTime: newResumeTime },
//         getAuthHeader()
//       );
//       setResumeTime(newResumeTime);
//       setError('');
//     } catch (error) {
//       setError('Failed to save resume time. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name === 'employeeId') {
//       const employee = employees.find(emp => emp._id === value);
//       setForm({
//         ...form,
//         employeeId: value,
//         employeeName: employee?.name || '',
//       });
//     } else {
//       setForm({ ...form, [name]: value });
//     }
//   };

//   const validateForm = () => {
//     if (!form.employeeId || !form.employeeName) return 'Please select an employee.';
//     if (form.signOutTime && form.signInTime >= form.signOutTime) {
//       return 'Sign-out time must be after sign-in time.';
//     }
//     if (form.taskEffectiveness < 0 || form.taskEffectiveness > 100) {
//       return 'Task effectiveness must be between 0 and 100.';
//     }
//     if (!['Present', 'Absent'].includes(form.status)) return 'Please select a valid status.';
//     return '';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationError = validateForm();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     // Check for duplicate attendance
//     const isDuplicate = await checkDuplicateAttendance(
//       form.employeeId,
//       form.date,
//       editingId // Exclude the current record when editing
//     );
//     if (isDuplicate && !editingId) {
//       setError('This employee already has an attendance record for this date.');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const isLate =
//         form.status === 'Present' &&
//         moment(`${form.date}T${form.signInTime}`).isAfter(
//           moment(`${form.date}T${resumeTime}`)
//         );

//       const data = {
//         employeeId: form.employeeId,
//         employeeName: form.employeeName,
//         date: form.date,
//         signInTime: moment(`${form.date}T${form.signInTime}`).toISOString(),
//         signOutTime: form.signOutTime
//           ? moment(`${form.date}T${form.signOutTime}`).toISOString()
//           : undefined,
//         taskEffectiveness: parseInt(form.taskEffectiveness) || 0,
//         status: form.status,
//         isLate,
//       };

//       if (editingId) {
//         await axios.put(`${API_BASE_URL}/attendance/${editingId}`, data, getAuthHeader());
//       } else {
//         await axios.post(`${API_BASE_URL}/attendance`, data, getAuthHeader());
//       }
//       fetchAttendances();
//       setError('');
//       // Reset form only for new records
//       if (!editingId) {
//         setForm({
//           employeeId: '',
//           employeeName: '',
//           date: moment().format('YYYY-MM-DD'),
//           signInTime: moment().format('HH:mm'),
//           signOutTime: '',
//           taskEffectiveness: 0,
//           status: 'Present',
//         });
//         setEditingId(null);
//       }
//     } catch (error) {
//       setError(
//         error.response?.data?.error ||
//           (error.code === 'ERR_NETWORK'
//             ? 'Network error. Please check your connection.'
//             : 'Failed to save attendance. Please try again.')
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = (attendance) => {
//     setForm({
//       employeeId: attendance.employeeId?._id || '',
//       employeeName: attendance.employeeName || '',
//       date: moment(attendance.date).format('YYYY-MM-DD'),
//       signInTime: attendance.signInTime ? moment(attendance.signInTime).format('HH:mm') : '',
//       signOutTime: attendance.signOutTime ? moment(attendance.signOutTime).format('HH:mm') : '',
//       taskEffectiveness: attendance.taskEffectiveness || 0,
//       status: attendance.status || 'Present',
//     });
//     setEditingId(attendance._id);
//     setError('');
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Are you sure you want to delete this attendance record?')) return;
//     setSubmitting(true);
//     try {
//       await axios.delete(`${API_BASE_URL}/attendance/${id}`, getAuthHeader());
//       fetchAttendances();
//       setError('');
//     } catch (error) {
//       setError('Failed to delete attendance. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const getStatusColor = (status, isLate) => {
//     if (status === 'Absent') return 'text-red-600';
//     if (status === 'Present' && isLate) return 'text-yellow-600';
//     return 'text-green-600';
//   };

//   return (
//     <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Attendance Management</h1>
//       {error && <p className="text-red-500 mb-4" aria-live="assertive">{error}</p>}
//       {loading && <p className="text-gray-600 mb-4" aria-live="polite">Loading...</p>}
//       <div className="bg-white p-4 rounded-lg shadow-md mb-6">
//         <h2 className="text-lg sm:text-xl font-semibold mb-4">Set Resume Time</h2>
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1">
//             <label htmlFor="resumeTime" className="block text-sm font-medium text-gray-700">
//               Company Resume Time
//             </label>
//             <input
//               id="resumeTime"
//               type="time"
//               value={newResumeTime}
//               onChange={handleResumeTimeChange}
//               className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//               aria-required="true"
//             />
//           </div>
//           <button
//             onClick={handleResumeTimeSubmit}
//             disabled={submitting}
//             className={`bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 ${
//               submitting ? 'opacity-50 cursor-not-allowed' : ''
//             }`}
//           >
//             {submitting ? 'Saving...' : 'Set Resume Time'}
//           </button>
//         </div>
//       </div>
//       <div className="bg-white p-4 rounded-lg shadow-md mb-6">
//         <h2 className="text-lg sm:text-xl font-semibold mb-4">
//           {editingId ? 'Edit Attendance' : 'Record Attendance'}
//         </h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
//               Employee
//             </label>
//             <select
//               id="employeeId"
//               name="employeeId"
//               value={form.employeeId}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//               required
//               aria-required="true"
//             >
//               <option value="">Select Employee</option>
//               {employees.map(emp => (
//                 <option key={emp._id} value={emp._id}>
//                   {emp.name} ({emp.jobType})
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label htmlFor="date" className="block text-sm font-medium text-gray-700">
//               Date
//             </label>
//             {editingId ? (
//               <input
//                 id="date"
//                 type="date"
//                 name="date"
//                 value={form.date}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//                 required
//                 aria-required="true"
//               />
//             ) : (
//               <p className="w-full p-2 border rounded-md bg-gray-50 text-gray-700">
//                 {form.date}
//               </p>
//             )}
//           </div>
//           <div>
//             <label htmlFor="signInTime" className="block text-sm font-medium text-gray-700">
//               Sign-In Time
//             </label>
//             {editingId ? (
//               <input
//                 id="signInTime"
//                 type="time"
//                 name="signInTime"
//                 value={form.signInTime}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//               />
//             ) : (
//               <p className="w-full p-2 border rounded-md bg-gray-50 text-gray-700">
//                 {form.signInTime}
//               </p>
//             )}
//           </div>
//           <div>
//             <label htmlFor="signOutTime" className="block text-sm font-medium text-gray-700">
//               Sign-Out Time
//             </label>
//             <input
//               id="signOutTime"
//               type="time"
//               name="signOutTime"
//               value={form.signOutTime}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="status" className="block text-sm font-medium text-gray-700">
//               Status
//             </label>
//             <select
//               id="status"
//               name="status"
//               value={form.status}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//               required
//               aria-required="true"
//             >
//               <option value="Present">Present</option>
//               <option value="Absent">Absent</option>
//             </select>
//           </div>
//           <div>
//             <label htmlFor="taskEffectiveness" className="block text-sm font-medium text-gray-700">
//               Task Effectiveness (0-100)
//             </label>
//             <input
//               id="taskEffectiveness"
//               type="number"
//               name="taskEffectiveness"
//               value={form.taskEffectiveness}
//               onChange={handleInputChange}
//               min="0"
//               max="100"
//               placeholder="Task Effectiveness"
//               className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//           <button
//             onClick={handleSubmit}
//             disabled={submitting}
//             className={`w-full sm:col-span-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 ${
//               submitting ? 'opacity-50 cursor-not-allowed' : ''
//             }`}
//           >
//             {submitting ? 'Processing...' : editingId ? 'Update' : 'Submit'}
//           </button>
//         </div>
//       </div>
//       <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
//         <h2 className="text-lg sm:text-xl font-semibold mb-4">Attendance Records</h2>
//         {loading ? (
//           <p className="text-gray-600" aria-live="polite">Loading records...</p>
//         ) : attendances.length === 0 ? (
//           <p className="text-gray-600" aria-live="polite">No attendance records found.</p>
//         ) : (
//           <table className="w-full text-left text-sm">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="p-2">Employee</th>
//                 <th className="p-2">Job Type</th>
//                 <th className="p-2">Date</th>
//                 <th className="p-2">Status</th>
//                 <th className="p-2">Hours Worked</th>
//                 <th className="p-2">Effectiveness</th>
//                 <th className="p-2 sm:table-cell hidden">Actions</th>
//                 <th className="p-2 sm:hidden">Manage</th>
//               </tr>
//             </thead>
//             <tbody>
//               {attendances.map(att => (
//                 <tr key={att._id} className="border-b">
//                   <td className="p-2">{att.employeeId?.name || att.employeeName || 'Unknown'}</td>
//                   <td className={`p-2 ${att.employeeId?.jobType === "Permanent" ? "text-green-600 font-sembold" : att.employeeId?.jobType === "Hybrid" ? "text-blue-400 font-semibold" : "text-yellow-600 font-semibold"}`}
//                   >{att.employeeId?.jobType || 'N/A'}</td>
//                   <td className="p-2">{moment(att.date).format('YYYY-MM-DD')}</td>
//                   <td className="p-2">
//                     <span
//                       className={getStatusColor(att.status, att.isLate)}
//                       aria-label={att.isLate ? `${att.status} (Late)` : att.status}
//                     >
//                       {att.status}
//                       {att.status === 'Present' && att.isLate && ' (Late)'}
//                     </span>
//                   </td>
//                   <td className="p-2">{att.hoursWorked.toFixed(2)}</td>
//                   <td className="p-2">{att.taskEffectiveness}%</td>
//                   <td className="p-2 sm:table-cell hidden">
//                     <button
//                       onClick={() => handleEdit(att)}
//                       className="text-blue-600 hover:underline mr-2"
//                       disabled={submitting}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(att._id)}
//                       className="text-red-600 hover:underline"
//                       disabled={submitting}
//                     >
//                       Delete
//                     </button>
//                   </td>
//                   <td className="p-2 sm:hidden">
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handleEdit(att)}
//                         className="text-blue-600 hover:underline"
//                         disabled={submitting}
//                       >
//                         ✎
//                       </button>
//                       <button
//                         onClick={() => handleDelete(att._id)}
//                         className="text-red-600 hover:underline"
//                         disabled={submitting}
//                       >
//                         🗑
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AttendanceManagement;





import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const AttendanceManagement = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [resumeTime, setResumeTime] = useState("09:00"); // Default resume time
  const [newResumeTime, setNewResumeTime] = useState(resumeTime);
  const [form, setForm] = useState({
    employeeId: '',
    employeeName: '',
    date: moment().format('YYYY-MM-DD'),
    signInTime: moment().format('HH:mm'),
    signOutTime: '',
    taskEffectiveness: 0,
    status: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
  const [monthlyPresence, setMonthlyPresence] = useState([]);

  useEffect(() => {
    fetchAttendances();
    fetchEmployees();
    fetchResumeTime();
    fetchMonthlyPresence();
  }, []);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/attendance`, getAuthHeader());
      setAttendances(res.data || []);
      setError('');
    } catch (error) {
      setError('Failed to fetch attendances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`, getAuthHeader());
      setEmployees(res.data || []);
      setError('');
    } catch (error) {
      setError('Failed to fetch employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumeTime = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/work-schedule`, getAuthHeader());
      setResumeTime(res.data?.resumeTime || "09:00");
      setNewResumeTime(res.data?.resumeTime || "09:00");
    } catch (error) {
      setError('Failed to fetch resume time. Using default 09:00.');
    }
  };

  const fetchMonthlyPresence = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/attendance?month=${selectedMonth}`,
        getAuthHeader()
      );
      const records = res.data || [];
      const presenceCounts = employees.map(emp => ({
        employeeId: emp._id,
        employeeName: emp.name,
        presentDays: records.filter(
          rec => rec.employeeId?._id === emp._id && rec.status === 'Present'
        ).length,
      }));
      setMonthlyPresence(presenceCounts);
      setError('');
    } catch (error) {
      setError('Failed to fetch monthly presence data. Please try again.');
    }
  };

  const checkDuplicateAttendance = async (employeeId, date, excludeId = null) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/attendance?employeeId=${employeeId}&date=${date}`,
        getAuthHeader()
      );
      const existing = res.data || [];
      return existing.some(att => att._id !== excludeId);
    } catch (error) {
      setError('Failed to check for existing attendance. Please try again.');
      return false;
    }
  };

  const handleResumeTimeChange = (e) => {
    setNewResumeTime(e.target.value);
  };

  const handleResumeTimeSubmit = async () => {
    if (!newResumeTime || !/^[0-2][0-9]:[0-5][0-9]$/.test(newResumeTime)) {
      setError('Please enter a valid time (HH:mm).');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/work-schedule`,
        { resumeTime: newResumeTime },
        getAuthHeader()
      );
      setResumeTime(newResumeTime);
      setError('');
    } catch (error) {
      setError('Failed to save resume time. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    fetchMonthlyPresence();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'employeeId') {
      const employee = employees.find(emp => emp._id === value);
      setForm({
        ...form,
        employeeId: value,
        employeeName: employee?.name || '',
        status: value ? 'Present' : '', // Set status to Present when employee is selected
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    if (!form.employeeId || !form.employeeName) return 'Please select an employee.';
    if (form.signOutTime && form.signInTime >= form.signOutTime) {
      return 'Sign-out time must be after sign-in time.';
    }
    if (form.taskEffectiveness < 0 || form.taskEffectiveness > 100) {
      return 'Task effectiveness must be between 0 and 100.';
    }
    if (form.employeeId && !['Present', 'Absent'].includes(form.status)) {
      return 'Please select a valid status.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check for duplicate attendance
    const isDuplicate = await checkDuplicateAttendance(
      form.employeeId,
      form.date,
      editingId // Exclude the current record when editing
    );
    if (isDuplicate && !editingId) {
      setError('This employee already has an attendance record for this date.');
      return;
    }

    setSubmitting(true);
    try {
        const isLate =
        form.status === 'Present' &&
        moment(`${form.date}T${form.signInTime}`, 'YYYY-MM-DDTHH:mm', true).isValid() &&
        moment(`${form.date}T${resumeTime}`, 'YYYY-MM-DDTHH:mm', true).isValid() &&
        moment(`${form.date}T${form.signInTime}`, 'YYYY-MM-DDTHH:mm').isAfter(
          moment(`${form.date}T${resumeTime}`, 'YYYY-MM-DDTHH:mm')
        );

      const data = {
        employeeId: form.employeeId,
        employeeName: form.employeeName,
        date: form.date,
        signInTime: moment(`${form.date}T${form.signInTime}`).toISOString(),
        signOutTime: form.signOutTime
          ? moment(`${form.date}T${form.signOutTime}`).toISOString()
          : undefined,
        taskEffectiveness: parseInt(form.taskEffectiveness) || 0,
        status: form.status,
        isLate,
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/attendance/${editingId}`, data, getAuthHeader());
      } else {
        await axios.post(`${API_BASE_URL}/attendance`, data, getAuthHeader());
      }
      fetchAttendances();
      fetchMonthlyPresence();
      setError('');
      // Reset form only for new records
      if (!editingId) {
        setForm({
          employeeId: '',
          employeeName: '',
          date: moment().format('YYYY-MM-DD'),
          signInTime: moment().format('HH:mm'),
          signOutTime: '',
          taskEffectiveness: 0,
          status: '',
        });
        setEditingId(null);
      }
    } catch (error) {
      setError(
        error.response?.data?.error ||
          (error.code === 'ERR_NETWORK'
            ? 'Network error. Please check your connection.'
            : 'Failed to save attendance. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (attendance) => {
    setForm({
      employeeId: attendance.employeeId?._id || '',
      employeeName: attendance.employeeName || '',
      date: moment(attendance.date).format('YYYY-MM-DD'),
      signInTime: attendance.signInTime ? moment(attendance.signInTime).format('HH:mm') : '',
      signOutTime: attendance.signOutTime ? moment(attendance.signOutTime).format('HH:mm') : '',
      taskEffectiveness: attendance.taskEffectiveness || 0,
      status: attendance.status || '',
    });
    setEditingId(attendance._id);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    setSubmitting(true);
    try {
      await axios.delete(`${API_BASE_URL}/attendance/${id}`, getAuthHeader());
      fetchAttendances();
      fetchMonthlyPresence();
      setError('');
    } catch (error) {
      setError('Failed to delete attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status, isLate) => {
    if (status === 'Absent') return 'text-red-600';
    if (status === 'Present' && isLate) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getLateColor = (isLate) => {
    return isLate ? 'text-yellow-600' : 'text-green-600';
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Attendance Management</h1>
      {error && <p className="text-red-500 mb-4" aria-live="assertive">{error}</p>}
      {loading && <p className="text-gray-600 mb-4" aria-live="polite">Loading...</p>}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Set Resume Time</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="resumeTime" className="block text-sm font-medium text-gray-700">
              Company Resume Time
            </label>
            <input
              id="resumeTime"
              type="time"
              value={newResumeTime}
              onChange={handleResumeTimeChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-required="true"
            />
          </div>
          <button
            onClick={handleResumeTimeSubmit}
            disabled={submitting}
            className={`bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Saving...' : 'Set Resume Time'}
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Monthly Presence</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">
              Select Month
            </label>
            <input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {monthlyPresence.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Employee</th>
                <th className="p-2">Present Days</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPresence.map(emp => (
                <tr key={emp.employeeId} className="border-b">
                  <td className="p-2">{emp.employeeName}</td>
                  <td className="p-2">{emp.presentDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No presence data for this month.</p>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {editingId ? 'Edit Attendance' : 'Record Attendance'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
              Employee
            </label>
            <select
              id="employeeId"
              name="employeeId"
              value={form.employeeId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.jobType})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            {editingId ? (
              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                aria-required="true"
              />
            ) : (
              <p className="w-full p-2 border rounded-md bg-gray-50 text-gray-700">
                {form.date}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="signInTime" className="block text-sm font-medium text-gray-700">
              Sign-In Time
            </label>
            {editingId ? (
              <input
                id="signInTime"
                type="time"
                name="signInTime"
                value={form.signInTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="w-full p-2 border rounded-md bg-gray-50 text-gray-700">
                {form.signInTime}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="signOutTime" className="block text-sm font-medium text-gray-700">
              Sign-Out Time
            </label>
            <input
              id="signOutTime"
              type="time"
              name="signOutTime"
              value={form.signOutTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
            >
              <option value="">Select Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <div>
            <label htmlFor="taskEffectiveness" className="block text-sm font-medium text-gray-700">
              Task Effectiveness (0-100)
            </label>
            <input
              id="taskEffectiveness"
              type="number"
              name="taskEffectiveness"
              value={form.taskEffectiveness}
              onChange={handleInputChange}
              min="0"
              max="100"
              placeholder="Task Effectiveness"
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full sm:col-span-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Processing...' : editingId ? 'Update' : 'Submit'}
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Attendance Records</h2>
        {loading ? (
          <p className="text-gray-600" aria-live="polite">Loading records...</p>
        ) : attendances.length === 0 ? (
          <p className="text-gray-600" aria-live="polite">No attendance records found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Employee</th>
                <th className="p-2">Job Type</th>
                <th className="p-2">Date</th>
                <th className="p-2">Sign-In Time</th>
                <th className="p-2">Sign-Out Time</th>
                <th className="p-2">Status</th>
                <th className="p-2">Late</th>
                <th className="p-2">Hours Worked</th>
                <th className="p-2">Effectiveness</th>
                <th className="p-2 sm:table-cell hidden">Actions</th>
                <th className="p-2 sm:hidden">Manage</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(att => (
                <tr key={att._id} className="border-b">
                  <td className="p-2">{att.employeeId?.name || att.employeeName || 'Unknown'}</td>
                  <td className={`p-2 ${att.employeeId?.jobType === "Permanent" ? "text-green-600 font-semibold" : att.employeeId?.jobType === "Hybrid" ? "text-blue-400 font-semibold" : "text-yellow-600 font-semibold"}`}>
                    {att.employeeId?.jobType || 'N/A'}
                  </td>
                  <td className="p-2">{moment(att.date).format('YYYY-MM-DD')}</td>
                  <td className="p-2">{att.signInTime ? moment(att.signInTime).format('HH:mm') : 'N/A'}</td>
                  <td className="p-2">{att.signOutTime ? moment(att.signOutTime).format('HH:mm') : 'N/A'}</td>
                  <td className="p-2">
                    <span
                      className={getStatusColor(att.status, att.isLate)}
                      aria-label={att.isLate ? `${att.status} (Late)` : att.status}
                    >
                      {att.status}
                      {att.status === 'Present' && att.isLate && ' (Late)'}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={getLateColor(att.isLate)} aria-label={att.isLate ? 'Late' : 'Not Late'}>
                      {att.isLate ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-2">{att.hoursWorked.toFixed(2)}</td>
                  <td className="p-2">{att.taskEffectiveness}%</td>
                  <td className="p-2 sm:table-cell hidden">
                    <button
                      onClick={() => handleEdit(att)}
                      className="text-blue-600 hover:underline mr-2"
                      disabled={submitting}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(att._id)}
                      className="text-red-600 hover:underline"
                      disabled={submitting}
                    >
                      Delete
                    </button>
                  </td>
                  <td className="p-2 sm:hidden">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(att)}
                        className="text-blue-600 hover:underline"
                        disabled={submitting}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(att._id)}
                        className="text-red-600 hover:underline"
                        disabled={submitting}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;