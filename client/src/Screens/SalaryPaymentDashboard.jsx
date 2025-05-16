
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";


// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:1000'}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const SalaryPaymentDashboard = () => {
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalTax: 0,
    totalIOU: 0,
    totalPenalty: 0,
    totalOtherDeduction: 0,
    attendance: { present: 0, late: 0, absent: 0 },
    jobTypeBreakdown: { permanent: 0, hybrid: 0, remote: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [paymentsRes, attendanceRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/payment`, getAuthHeader()),
          axios.get(`${API_BASE_URL}/attendance`, getAuthHeader()),
        ]);

        const payments = paymentsRes.data || [];
        const attendances = attendanceRes.data || [];

        if (payments.length === 0 && attendances.length === 0) {
          setHasData(false);
          return;
        }

        const totalPaid = payments.reduce((sum, p) => sum + (p.netSalary || 0), 0);
        const totalTax = payments.reduce((sum, p) => sum + (p.tax?.amount || 0), 0);
        const totalIOU = payments.reduce((sum, p) => sum + (p.IOU?.amount || 0), 0);
        const totalPenalty = payments.reduce((sum, p) => sum + (p.penalty?.amount || 0), 0);
        const totalOtherDeduction = payments.reduce(
          (sum, p) => sum + (p.otherDeduction?.amount || 0),
          0
        );

        const attendanceStats = attendances.reduce(
          (acc, a) => {
            acc[a.status?.toLowerCase() || 'absent']++;
            return acc;
          },
          { present: 0, late: 0, absent: 0 }
        );

        const jobTypeBreakdown = payments
          .filter(p => p.employeeId && p.employeeId.jobType)
          .reduce(
            (acc, p) => {
              const jobType = p.employeeId.jobType.toLowerCase();
              acc[jobType]++;
              return acc;
            },
            { permanent: 0, hybrid: 0, remote: 0 }
          );

        setStats({
          totalPaid,
          totalTax,
          totalIOU,
          totalPenalty,
          totalOtherDeduction,
          attendance: attendanceStats,
          jobTypeBreakdown,
        });
        setHasData(true);
      } catch (error) {
        setError(
          error.response?.data?.error ||
            (error.code === 'ERR_NETWORK'
              ? 'Network error. Please check your connection.'
              : 'Failed to fetch dashboard data. Please try again.')
        );
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Memoized Chart Data
  const paymentPieData = useMemo(
    () => ({
      labels: ['Net Salary', 'Tax', 'IOU', 'Penalty', 'Other Deductions'],
      datasets: [
        {
          data: [
            stats.totalPaid,
            stats.totalTax,
            stats.totalIOU,
            stats.totalPenalty,
            stats.totalOtherDeduction,
          ],
          backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'],
        },
      ],
    }),
    [stats]
  );

  const attendanceBarData = useMemo(
    () => ({
      labels: ['Present', 'Late', 'Absent'],
      datasets: [
        {
          label: 'Attendance Count',
          data: [stats.attendance.present, stats.attendance.late, stats.attendance.absent],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        },
      ],
    }),
    [stats]
  );

  const jobTypePieData = useMemo(
    () => ({
      labels: ['Permanent', 'Hybrid', 'Remote'],
      datasets: [
        {
          data: [
            stats.jobTypeBreakdown.permanent,
            stats.jobTypeBreakdown.hybrid,
            stats.jobTypeBreakdown.remote,
          ],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        },
      ],
    }),
    [stats]
  );


  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 10,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.label}: ${context?.parsed?.toFixed(2)}`,
        },
      },
    },
  };

  const formatNumber = (value) => {
    if (value === '' || value == null || isNaN(value)) return '';
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800" aria-label="Payroll Dashboard">
        Payroll Dashboard
      </h1>
      {loading && (
        <p className="text-gray-600 mb-4" aria-live="polite">
          Loading dashboard data...
        </p>
      )}
      {error && (
        <p className="text-red-500 mb-4" aria-live="assertive">
          {error}
        </p>
      )}
      {!hasData && !loading && !error && (
        <p className="text-gray-600 mb-4" aria-live="polite">
          No payment or attendance data available.
        </p>
      )}
      {hasData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Payment Breakdown</h2>
              <div className="h-64" aria-label="Payment Breakdown Pie Chart">
                <Pie data={paymentPieData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Attendance Statistics</h2>
              <div className="h-64" aria-label="Attendance Statistics Bar Chart">
                <Bar data={attendanceBarData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Employee Job Types</h2>
              <div className="h-64" aria-label="Employee Job Types Pie Chart">
                <Pie data={jobTypePieData} options={chartOptions} />
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg sm:text dedica-xl font-semibold mb-4">Financial Summary</h2>
              <p className="text-sm sm:text-base">
                Total Paid: N{formatNumber(stats.totalPaid.toFixed(2))}
              </p>
              <p className="text-sm sm:text-base">Total Tax: N{formatNumber(stats.totalTax.toFixed(2))}</p>
              <p className="text-sm sm:text-base">Total IOU: N{formatNumber(stats.totalIOU.toFixed(2))}</p>
              <p className="text-sm sm:text-base">
                Total Penalty: N{formatNumber(stats.totalPenalty.toFixed(2))}
              </p>
              <p className="text-sm sm:text-base">
                Other Deductions: N{stats.totalOtherDeduction.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Attendance Summary</h2>
              <p className="text-sm sm:text-base">Present: {stats.attendance.present}</p>
              <p className="text-sm sm:text-base">Late: {stats.attendance.late}</p>
              <p className="text-sm sm:text-base">Absent: {stats.attendance.absent}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalaryPaymentDashboard;



























































