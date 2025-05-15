import React, { useState, useEffect } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmployeeCard from '../../components/Employee/EmployeeCard';
import EmployeeModal from '../../components/Employee/EmployeeModal';
import SearchBar from '../../components/Employee/Search';
import axios from 'axios';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardContent = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', phone: '', jobRole: '', email: '', qualification: '',
    designation: '', department: '', jobType: '', salary: '',
    picture: '', AcctNo: '', Bank: '', AcctName: '',
    address: '', gender: '', complaints: ''
  });

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEmployees(response.data);
        setFilteredEmployees(response.data);
        // toast.success(response.data.message || "Successful", {
        //   style: { background: "#4CAF50", color: "white", fontSize: "bold" },
        // });
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error(error.message || "Failed", {
          style: { background: "#F44336", color: "white" },
        });
      }
    };
    fetchEmployees();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      if (isEdit) {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/employees/${selectedEmployee._id}`, formData, { headers });
        setEmployees(employees.map(emp => emp._id === selectedEmployee._id ? response.data : emp));
      } else {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/employees`, formData, { headers });
        setEmployees([...employees, response.data]);
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEmployees(employees.filter(emp => emp._id !== id));
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '', phone: '', jobRole: '', email: '', qualification: '',
      designation: '', department: '', jobType: '', salary: '',
      picture: '', AcctNo: '', Bank: '', AcctName: '',
      address: '', gender: '', complaints: ''
    });
    setIsEdit(false);
    setSelectedEmployee(null);
  };

  // Prepare chart data
  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [
        employees.filter(emp => emp.gender === 'Male').length,
        employees.filter(emp => emp.gender === 'Female').length
      ],
      backgroundColor: ['#FF6384', '#36A2EB'],
      borderWidth: 1,
    }]
  };

  const jobTypeData = {
    labels: ['Permanent', 'Hybrid', 'Remote'],
    datasets: [{
      data: [
        employees.filter(emp => emp.jobType === 'Permanent').length,
        employees.filter(emp => emp.jobType === 'Hybrid').length,
        employees.filter(emp => emp.jobType === 'Remote').length
      ],
      backgroundColor: ['#FFCE56', '#4BC0C0', '#9966FF'],
      borderWidth: 1,
    }]
  };

  const departmentData = {
    labels: [...new Set(employees.map(emp => emp.department))].filter(Boolean),
    datasets: [{
      data: [...new Set(employees.map(emp => emp.department))].map(dept => employees.filter(emp => emp.department === dept).length),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'].slice(0, [...new Set(employees.map(emp => emp.department))].length),
      borderWidth: 1,
    }]
  };

  const qualificationData = {
    labels: [...new Set(employees.map(emp => emp.qualification))].filter(Boolean),
    datasets: [{
      data: [...new Set(employees.map(emp => emp.qualification))].map(qual => employees.filter(emp => emp.qualification === qual).length),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'].slice(0, [...new Set(employees.map(emp => emp.qualification))].length),
      borderWidth: 1,
    }]
  };

  const salaryData = {
    labels: employees.map((_, i) => `Employee ${i + 1}`),
    datasets: [{
      label: 'Salary',
      data: employees.map(emp => emp.salary || 0),
      backgroundColor: '#36A2EB',
      borderColor: '#36A2EB',
      borderWidth: 1,
    }]
  };

  const overviewData = {
    labels: employees.map((_, i) => `Emp ${i + 1}`),
    datasets: [{
      label: 'Salary Trend',
      data: employees.map(emp => emp.salary || 0),
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: '#36A2EB',
      borderWidth: 2,
      tension: 0.4,
    }]
  };

  const savingsStatsData = {
    labels: ['2017', '2018', '2019', '2020'],
    datasets: [{
      label: 'Dollar',
      data: [employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) * 0.2, 0, 0, 0], // Placeholder logic
      backgroundColor: '#36A2EB',
    }, {
      label: 'Pound',
      data: [employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) * 0.15, 0, 0, 0], // Placeholder logic
      backgroundColor: '#FF6384',
    }]
  };

  const cashFlowData = {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020'],
    datasets: [{
      label: 'Cash Flow',
      data: [0, 2000, 4000, 6000, 8000, employees.reduce((sum, emp) => sum + (emp.salary || 0), 0)], // Cumulative salary
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: '#36A2EB',
      borderWidth: 2,
      tension: 0.4,
    }]
  };

  // New chart: Department Statistics (already prepared in departmentData, just adding a dedicated chart)
  const departmentStatsData = {
    labels: [...new Set(employees.map(emp => emp.department))].filter(Boolean),
    datasets: [{
      label: 'Employees per Department',
      data: [...new Set(employees.map(emp => emp.department))].map(dept => employees.filter(emp => emp.department === dept).length),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'].slice(0, [...new Set(employees.map(emp => emp.department))].length),
      borderWidth: 1,
    }]
  };

  // New chart: Monthly Salary Flow
  const totalSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const monthlySalary = totalSalary / 12;
  const monthlySalaryFlowData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Salary Payment',
      data: Array(12).fill(monthlySalary),
      backgroundColor: '#4BC0C0',
      borderColor: '#4BC0C0',
      borderWidth: 1,
    }]
  };

  // New chart: Yearly Salary Flow (5-year projection with slight growth)
  const yearlySalaryFlowData = {
    labels: ['2025', '2026', '2027', '2028', '2029'],
    datasets: [{
      label: 'Yearly Salary Payment',
      data: [totalSalary, totalSalary * 1.05, totalSalary * 1.1, totalSalary * 1.15, totalSalary * 1.2],
      backgroundColor: '#9966FF',
      borderColor: '#9966FF',
      borderWidth: 1,
    }]
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="chart-card">
          <h3 className="chart-title">Investment Structure</h3>
          <Doughnut data={genderData} />
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Sources</h3>
          <Doughnut data={jobTypeData} />
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Money Structure</h3>
          <Bar data={departmentData} />
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Income Dynamics</h3>
          <Bar data={qualificationData} />
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Overview</h3>
          <Line data={overviewData} />
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Savings Statistics</h3>
          <Bar data={savingsStatsData} />
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Annual Cash Flows</h3>
          <Line data={cashFlowData} />
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Department Statistics</h3>
          <Bar data={departmentStatsData} options={{ animation: { duration: 1000 } }} />
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Monthly Salary Flow</h3>
          <Bar data={monthlySalaryFlowData} options={{ animation: { duration: 1000 } }} />
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Yearly Salary Flow</h3>
          <Bar data={yearlySalaryFlowData} options={{ animation: { duration: 1000 } }} />
        </div>
      </div>

      {/* <div className="flex justify-between items-center mt-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
        <button
          onClick={() => {
            setShowModal(true);
            setIsEdit(false);
            resetForm();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Add Employee
        </button>
      </div>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredEmployees.map((employee, index) => (
          <EmployeeCard
            key={employee._id}
            employee={employee}
            index={index}
            onView={() => {
              setSelectedEmployee(employee);
              setShowModal(true);
              setIsEdit(false);
            }}
            onEdit={() => {
              setSelectedEmployee(employee);
              setFormData(employee);
              setIsEdit(true);
              setShowModal(true);
            }}
            onDelete={() => handleDelete(employee._id)}
          />
        ))}
      </div>

      <EmployeeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        isEdit={isEdit}
        selectedEmployee={selectedEmployee}
        onSubmit={handleSubmit}
      /> */}
    </div>
  );
};

export default DashboardContent;