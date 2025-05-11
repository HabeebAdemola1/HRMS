import  { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeCard from '../../components/Employee/EmployeeCard';
import EmployeeModal from '../../components/Employee/EmployeeModal';
import SearchBar from '../../components/Employee/Search';
import { toast } from 'sonner';

const Employees = () => {
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
            toast.success(response.data.message ||  "successful", {
                  style: { background: "#4CAF50", color: "white", fontSize: "bold" },
                });
             
      } catch (error) {
        console.error('Error fetching employees:', error);
         toast.error(error.message || "failed", {
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
        toast.success(response.data.message || "successful", {
            style: { background: "#4CAF50", color: "white", fontSize: "bold" },
          });
      } else {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/employees`, formData, { headers });
        setEmployees([...employees, response.data]);
        toast.success(response.data.message ||  "successful", {
            style: { background: "#4CAF50", color: "white", fontSize: "bold" },
          });
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(  error.response?.data?.message  || "failed", {
        style: { background: "#F44336", color: "white" },
      });
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      />
    </div>
  );
};

export default Employees;