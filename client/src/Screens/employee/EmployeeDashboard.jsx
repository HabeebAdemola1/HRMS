import { useState, useEffect } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

    const formatNumber = (value) => {
    if (value === '' || value == null || isNaN(value)) return '';
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  

  useEffect(() => {
    const uniqueNumber = localStorage.getItem('uniqueNumber');
    const token = localStorage.getItem('token');
    console.log('Token:', token, 'UniqueNumber:', uniqueNumber, 'VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);

    const fetchData = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/employees/employeedashboard`;
        console.log('fetchData: Requesting:', url);
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          // params: { uniqueNumber }, // Removed to rely on req.user.uniqueNumber
        });
        setEmployee(response.data.employee);
        console.log('Employee:', response.data.employee);
      } catch (error) {
        console.error('fetchData Error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          url: error.config?.url,
        });
        toast.error(error.response?.data?.message || 'Failed to fetch employee data', {
          style: { background: '#D33636', color: 'white' },
        });
      }
    };

    const fetchPayment = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/employees/employeepayment`;
        console.log('fetchPayment: Requesting:', url);
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          // params: { uniqueNumber }, // Removed to rely on req.user.uniqueNumber
        });
        setPayments(response.data.payment);
        console.log('Payments:', response.data.payment);
      } catch (error) {
        console.error('fetchPayment Error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          url: error.config?.url,
        });
        toast.error(error.response?.data?.message || 'Failed to fetch payment data', {
          style: { background: '#D33636', color: 'white' },
        });
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchData(), fetchPayment()]);
      setLoading(false);
    };

    if (token && uniqueNumber) {
      loadData();
    } else {
      toast.error('Please log in to view dashboard', {
        style: { background: '#D33636', color: 'white' },
      });
      setLoading(false);
    }
  }, []);

  // Chart Data
  const latestPayment = payments[0] || {};
  const deductionData = {
    labels: ['Tax', 'IOU', 'Penalty', 'Other Deductions'],
    datasets: [
      {
        data: [
          latestPayment.tax?.amount || 0,
          latestPayment.IOU?.amount || 0,
          latestPayment.penalty?.amount || 0,
          latestPayment.otherDeduction?.amount || 0,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const salaryData = {
    labels: payments.slice(0, 6).reverse().map(p => new Date(p.paymentDate).toLocaleDateString()),
    datasets: [
      {
        label: 'Gross Salary',
        data: payments.slice(0, 6).reverse().map(p => p.grossSalary || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Net Salary',
        data: payments.slice(0, 6).reverse().map(p => p.netSalary || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const salaryTrendData = {
    labels: payments.slice(0, 12).reverse().map(p => new Date(p.paymentDate).toLocaleDateString()),
    datasets: [
      {
        label: 'Net Salary Trend',
        data: payments.slice(0, 12).reverse().map(p => p.netSalary || 0),
        borderColor: '#36A2EB',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // Attendance
  const totalAttendance = payments.reduce((sum, p) => sum + (p.attendanceCount || 0), 0);
  const averageAttendance = payments.length ? (totalAttendance / payments.length).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-semibold text-red-600">Employee data not found</h2>
        <button
          onClick={() => window.location.href = '/login'}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Employee Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><strong>Name:</strong> {employee.name || 'Not set'}</p>
          <p><strong>Unique Number:</strong> {employee.uniqueNumber || 'Not set'}</p>
          <p><strong>Dashboard Access:</strong> {employee.dashboardAccess ? 'Enabled' : 'Disabled'}</p>
          {employee.adminId && (
            <>
              <p><strong>Admin Name:</strong> {employee.adminId.name || 'Not set'}</p>
              <p><strong>Admin Email:</strong> {employee.adminId.email || 'Not set'}</p>
            </>
          )}
             <p className='font-bold'>complaints:<strong className={`${employee.complaints === 'sacked'? 'text-red-500' : employee.complaints === 'dismissed' ? 'text-red-600' : employee.complaints === 'promotion' ? 'text-green-500' : employee.complaints === 'employment' ? 'text-green-500' :  employee.complaints === 'suspended' ? 'text-yellow-600' : 'text-blue-600' }`}> {employee.complaints}</strong> </p>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Attendance</h2>
        <p><strong>Total Attendance (All Periods):</strong> {totalAttendance} days</p>
        <p><strong>Average Attendance per Period:</strong> {averageAttendance} days</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Latest Payment Deductions</h2>
          <Doughnut data={deductionData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Salary Comparison</h2>
          <Bar data={salaryData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 col-span-1 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Net Salary Trend</h2>
          <Line data={salaryTrendData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Payroll Period</th>
                <th className="px-4 py-2 text-left">Payment Date</th>
                <th className="p-2">Gross Salary</th>
                <th className="p-2">Tax</th>
                <th className="p-2">IOU</th>
                <th className="p-2">Penalty</th>
                <th className="p-2">other deductions</th>
                <th className="p-2">Total Deductions</th>
                <th className="p-2">Net Salary</th>
                <th className="p-2">Daily Salary</th>
                <th className="p-2">Monthly Salary</th>
                <th className="p-2">Yearly Salary</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{payment.payrollPeriod}</td>
                  <td className="px-4 py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                    <td className="p-2">N{formatNumber(payment.grossSalary.toFixed(2))}</td>
                  <td className="p-2">N{formatNumber(payment?.tax.amount.toFixed(2))}</td>
                  <td className="p-2">N{formatNumber(payment?.IOU.amount.toFixed(2))}</td>
                  <td className="p-2">N{formatNumber(payment?.penalty.amount.toFixed(2))}</td>
                  <td className="p-2">N{formatNumber(payment?.otherDeduction.amount.toFixed(2))}</td>
                  <td className="p-2">N{formatNumber(payment?.totalDeductions?.toFixed(2))}</td>
                  <td className="p-2">N{formatNumber(payment.netSalary.toFixed(2))}</td>
                  <td className="p-2">N{formatNumber(payment.dailySalary?.toFixed(2))}</td>
                  <td className="p-2">N{formatNumber(payment.monthlySalary?.toFixed(2))}</td>
                  <td className="p-2">N{formatNumber(payment.yearlySalary?.toFixed(2))}</td>

                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded ${
                      payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">{payment.attendanceCount || 0} days</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center text-gray-500">No payment records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;