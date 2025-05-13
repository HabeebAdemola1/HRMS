import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { toast } from "sonner";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:1000'}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [daysPresent, setDaysPresent] = useState(0);
  const [daysAbsent, setDaysAbsent] = useState(0);
  const [lateDays, setLateDays] = useState(0);
  const [form, setForm] = useState({
    employeeId: '',
    grossSalary: '',
    paymentDate: '',
    payrollPeriod: '',
    isFullMonth: true,
    useAttendanceForSalary: false,
    lateDeductionAmount: 0,
    tax: { percentage: 0, amount: 0, mode: 'percentage' },
    IOU: { percentage: 0, amount: 0, mode: 'percentage' },
    penalty: { percentage: 0, amount: 0, mode: 'percentage' },
    otherDeduction: { percentage: 0, amount: 0, mode: 'percentage' },
    status: 'Pending',
    dailySalary: 0,
    monthlySalary: 0,
    yearlySalary: 0,
    totalDeductions: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchEmployees();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/payment`, getAuthHeader());
      setPayments(res.data || []);
      setError('');
    } catch (error) {
      setError('Failed to fetch payments');
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
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async (employeeId, payrollPeriod) => {
    if (!employeeId || !payrollPeriod) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/attendance?employeeId=${employeeId}&payrollPeriod=${payrollPeriod}`,
        getAuthHeader()
      );
      const records = res.data || [];
      const present = records.filter(rec => rec.status === 'Present').length;
      const absent = records.filter(rec => rec.status === 'Absent').length;
      const late = records.filter(rec => rec.status === 'Present' && rec.isLate).length;
      setDaysPresent(present);
      setDaysAbsent(absent);
      setLateDays(late);
      setError('');
    } catch (error) {
      setError('Failed to fetch attendance data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (name.includes('.')) {
      const [field, subField] = name.split('.');
      setForm({
        ...form,
        [field]: { ...form[field], [subField]: subField === 'mode' ? value : parseFloat(value) || 0 },
      });
    } else {
      setForm({ ...form, [name]: name === 'isFullMonth' ? value === 'true' : value });
    }

    if (name === 'employeeId' || name === 'payrollPeriod') {
      const newEmployeeId = name === 'employeeId' ? value : form.employeeId;
      const newPayrollPeriod = name === 'payrollPeriod' ? value : form.payrollPeriod;
      if (newEmployeeId && newPayrollPeriod) {
        fetchAttendanceData(newEmployeeId, newPayrollPeriod);
      }
    }
  };

  const calculateSalariesAndDeductions = () => {
    const grossSalary = parseFloat(form.grossSalary) || 0;
    const totalWorkingDays = form.isFullMonth ? 22 : 15; // Adjust for partial months
    const dailySalary = grossSalary / totalWorkingDays;
    const monthlySalary = grossSalary;
    const yearlySalary = grossSalary * 12;

    let baseSalary = grossSalary;
    let lateDeduction = 0;

    if (form.useAttendanceForSalary) {
      baseSalary = dailySalary * daysPresent;
      lateDeduction = lateDays * (parseFloat(form.lateDeductionAmount) || 0);
    }

    const deductions = ['tax', 'IOU', 'penalty', 'otherDeduction'].reduce((total, field) => {
      const { mode, percentage, amount } = form[field];
      const deduction = mode === 'percentage' ? (grossSalary * percentage) / 100 : amount;
      return total + deduction;
    }, 0);

    const totalDeductions = deductions + lateDeduction;
    const netSalary = baseSalary - totalDeductions;

    return { dailySalary, monthlySalary, yearlySalary, totalDeductions, netSalary };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { dailySalary, monthlySalary, yearlySalary, totalDeductions, netSalary } =
        calculateSalariesAndDeductions();

      const data = {
        ...form,
        grossSalary: parseFloat(form.grossSalary) || 0,
        paymentDate: form.paymentDate,
        isFullMonth: form.isFullMonth,
        daysPresent,
        daysAbsent,
        lateDays,
        dailySalary,
        monthlySalary,
        yearlySalary,
        totalDeductions,
        netSalary,
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/payment/${editingId}`, data, getAuthHeader());
      } else {
        await axios.post(`${API_BASE_URL}/payment`, data, getAuthHeader());
      }
      fetchPayments();
      setForm({
        employeeId: '',
        grossSalary: '',
        paymentDate: '',
        payrollPeriod: '',
        isFullMonth: true,
        useAttendanceForSalary: false,
        lateDeductionAmount: 0,
        tax: { percentage: 0, amount: 0, mode: 'percentage' },
        IOU: { percentage: 0, amount: 0, mode: 'percentage' },
        penalty: { percentage: 0, amount: 0, mode: 'percentage' },
        otherDeduction: { percentage: 0, amount: 0, mode: 'percentage' },
        status: 'Pending',
        dailySalary: 0,
        monthlySalary: 0,
        yearlySalary: 0,
        totalDeductions: 0,
      });
      setDaysPresent(0);
      setDaysAbsent(0);
      setLateDays(0);
      setEditingId(null);
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save payment');
      toast.error(error.response?.data?.error || error.response?.data?.message || "failed to save payment", {
        style: {backgroundColor : "#fff", color: "black"

        }
      })
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setForm({
      employeeId: payment.employeeId._id,
      grossSalary: payment.grossSalary,
      paymentDate: moment(payment.paymentDate).format('YYYY-MM-DD'),
      payrollPeriod: payment.payrollPeriod,
      isFullMonth: payment.isFullMonth,
      useAttendanceForSalary: payment.useAttendanceForSalary || false,
      lateDeductionAmount: payment.lateDeductionAmount || 0,
      tax: { ...payment.tax, mode: payment.tax.mode || 'percentage' },
      IOU: { ...payment.IOU, mode: payment.IOU.mode || 'percentage' },
      penalty: { ...payment.penalty, mode: payment.penalty.mode || 'percentage' },
      otherDeduction: { ...payment.otherDeduction, mode: payment.otherDeduction.mode || 'percentage' },
      status: payment.status,
      dailySalary: payment.dailySalary || 0,
      monthlySalary: payment.monthlySalary || 0,
      yearlySalary: payment.yearlySalary || 0,
      totalDeductions: payment.totalDeductions || 0,
    });
    setDaysPresent(payment.daysPresent || 0);
    setDaysAbsent(payment.daysAbsent || 0);
    setLateDays(payment.lateDays || 0);
    setEditingId(payment._id);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/payment/${id}`, getAuthHeader());
      fetchPayments();
      setError('');
    } catch (error) {
      setError('Failed to delete payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Payment Management</h1>
      {error && <p className="text-red-500 mb-4" aria-live="assertive">{error}</p>}
      {loading && <p className="text-gray-600 mb-4" aria-live="polite">Loading...</p>}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {editingId ? 'Edit Payment' : 'Record Payment'}
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
            <label className="block text-sm font-medium text-gray-700">Attendance</label>
            <p className="w-full p-2 border rounded-md bg-gray-50 text-gray-700">
              Days Present: {daysPresent} | Days Absent: {daysAbsent} | Late Days: {lateDays}
            </p>
          </div>
          <div>
            <label htmlFor="grossSalary" className="block text-sm font-medium text-gray-700">
              Gross Salary
            </label>
            <input
              id="grossSalary"
              type="number"
              name="grossSalary"
              value={form.grossSalary}
              onChange={handleInputChange}
              placeholder="Gross Salary"
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
              Payment Date
            </label>
            <input
              id="paymentDate"
              type="date"
              name="paymentDate"
              value={form.paymentDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="payrollPeriod" className="block text-sm font-medium text-gray-700">
              Payroll Period
            </label>
            <input
              id="payrollPeriod"
              type="text"
              name="payrollPeriod"
              value={form.payrollPeriod}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD-YYYY-MM-DD"
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="isFullMonth" className="block text-sm font-medium text-gray-700">
              Month Type
            </label>
            <select
              id="isFullMonth"
              name="isFullMonth"
              value={form.isFullMonth}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={true}>Full Month</option>
              <option value={false}>Partial Month</option>
            </select>
          </div>
          <div>
            <label htmlFor="useAttendanceForSalary" className="block text-sm font-medium text-gray-700">
              Use Attendance for Salary Calculation
            </label>
            <input
              id="useAttendanceForSalary"
              type="checkbox"
              name="useAttendanceForSalary"
              checked={form.useAttendanceForSalary}
              onChange={handleInputChange}
              className="p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {form.useAttendanceForSalary && (
            <div>
              <label htmlFor="lateDeductionAmount" className="block text-sm font-medium text-gray-700">
                Deduction per Late Day
              </label>
              <input
                id="lateDeductionAmount"
                type="number"
                name="lateDeductionAmount"
                value={form.lateDeductionAmount}
                onChange={handleInputChange}
                placeholder="Deduction per Late"
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
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
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          {['tax', 'IOU', 'penalty', 'otherDeduction'].map(field => (
            <div key={field} className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`${field}.value`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field === 'tax' ? 'Tax' : field === 'IOU' ? 'IOU' : field === 'penalty' ? 'Penalty' : 'Other Deduction'} {form[field].mode === 'percentage' ? 'Percentage' : 'Amount'}
                </label>
                <input
                  id={`${field}.value`}
                  type="number"
                  name={`${field}.${form[field].mode}`}
                  value={form[field][form[field].mode]}
                  onChange={handleInputChange}
                  placeholder={`${field === 'tax' ? 'Tax' : field === 'IOU' ? 'IOU' : field === 'penalty' ? 'Penalty' : 'Other Deduction'} ${form[field].mode === 'percentage' ? 'Percentage' : 'Amount'}`}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor={`${field}.mode`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Deduction Type
                </label>
                <select
                  id={`${field}.mode`}
                  name={`${field}.mode`}
                  value={form[field].mode}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full sm:col-span-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : editingId ? 'Update' : 'Submit'}
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Payment Records</h2>
        {loading ? (
          <p className="text-gray-600" aria-live="polite">Loading records...</p>
        ) : payments.length === 0 ? (
          <p className="text-gray-600" aria-live="polite">No payment records found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Employee</th>
                <th className="p-2">Job Type</th>
                <th className="p-2">Days Present</th>
                <th className="p-2">Days Absent</th>
                <th className="p-2">Late Days</th>
                <th className="p-2">Gross Salary</th>
                <th className="p-2">Total Deductions</th>
                <th className="p-2">Net Salary</th>
                <th className="p-2">Daily Salary</th>
                <th className="p-2">Monthly Salary</th>
                <th className="p-2">Yearly Salary</th>
                <th className="p-2">Payment Date</th>
                <th className="p-2">Status</th>
                <th className="p-2 sm:table-cell hidden">Actions</th>
                <th className="p-2 sm:hidden">Manage</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(pay => (
                <tr key={pay._id} className="border-b">
                  <td className="p-2">{pay.employeeId.name}</td>
                  <td className="p-2">{pay.employeeId.jobType}</td>
                  <td className="p-2">{pay.daysPresent || 0}</td>
                  <td className="p-2">{pay.daysAbsent || 0}</td>
                  <td className="p-2">{pay.lateDays || 0}</td>
                  <td className="p-2">N{pay.grossSalary.toFixed(2)}</td>
                  <td className="p-2">N{pay.totalDeductions?.toFixed(2)}</td>
                  <td className="p-2">N{pay.netSalary.toFixed(2)}</td>
                  <td className="p-2">N{pay.dailySalary?.toFixed(2)}</td>
                  <td className="p-2">N{pay.monthlySalary?.toFixed(2)}</td>
                  <td className="p-2">N{pay.yearlySalary?.toFixed(2)}</td>
                  <td className="p-2">{moment(pay.paymentDate).format('YYYY-MM-DD')}</td>
                  <td className="p-2">{pay.status}</td>
                  <td className="p-2 sm:table-cell hidden">
                    <button
                      onClick={() => handleEdit(pay)}
                      className="text-blue-600 hover:underline mr-2"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pay._id)}
                      className="text-red-600 hover:underline"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                  <td className="p-2 sm:hidden">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(pay)}
                        className="text-blue-600 hover:underline"
                        disabled={loading}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(pay._id)}
                        className="text-red-600 hover:underline"
                        disabled={loading}
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

export default PaymentManagement;