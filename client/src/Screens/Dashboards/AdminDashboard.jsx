import  { useEffect, useState } from 'react';
import { FaUser, FaComments, FaCog, FaBars, FaTimes, FaMoneyCheckAlt, FaUserTag, FaBuilding, FaDollarSign, FaPaypal, FaAviato, FaPersonBooth, FaPeopleCarry, } from 'react-icons/fa';

import DashboardContent from './DashboardContent';
import { FaJoget } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'sonner';
import Employees from '../others/Employees';
import Settings from '../others/Settings';
import Productivity from '../others/Productivity';
import Department from '../others/Department';
import SalaryPaymentDashboard from '../SalaryPaymentDashboard';
import PaymentManagement from '../../components/payment/Payment';
import AttendanceManagement from '../../components/payment/Attendance';
import { WorkSchedule } from '../../../../backend/models/paymentSchema';
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState([])
  const [currentDateRange, setCurrentDateRange] = useState('')

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const dateTime = `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
      setCurrentDateRange(`${dateTime} - ${dateTime}`); // Same start and end for current time
    };

    updateDateTime(); // Set initial value
    const interval = setInterval(updateDateTime, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [])


  useEffect(() => {
    const token = localStorage.getItem("token")
    const fetchData = async() => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setData(response.data.user)
        console.log(response.data.user, "ur data")
        toast.success(response.data.message, {style: {
          background: "#16a34a", color: "white"
        }})
      } catch (error) {
        console.log(error)
        toast.error(error.message, {style: {
          background: "#D33636FF", color: "white"
        }})
      }
    }

    fetchData()
  }, [])



  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'employees':
        return <Employees />;
      case 'settings':
        return < Settings/>;
      case 'productivity':
         return < Productivity/>;
      case 'departments':
        return <Department />
      case 'job-Types':
        return <Department />
      case 'attendance':
        return <AttendanceManagement />
      // case 'work':
      //   return <WorkSchedule />
      case 'make-payments':
          return <PaymentManagement />
      case 'salary':
          return <SalaryPaymentDashboard />

      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex min-h-screen mt-20 bg-gray-100 font-sans">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-16 bg-blue-600 text-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-4 border-b border-blue-700 relative">
          {/* <h1 className="text-2xl font-bold hidden md:block">Executive Dashboard</h1> */}
          <button
            className="md:hidden absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={toggleSidebar}
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>
        <nav className="mt-6">
          <ul>
            <li
              className="group relative"
              onClick={() => {
                setActiveTab('dashboard');
                setIsSidebarOpen(false);
              }}
            >
              <div className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <FaUser className="text-xl" />
              </div>
              <span className="absolute left-full ml-2 w-0 overflow-hidden group-hover:w-32 bg-blue-700 text-white px-2 py-1 rounded-r transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                Dashboard
              </span>
              {activeTab === 'dashboard' && (
                <div className="absolute left-0 w-1 h-8 bg-white top-1/2 transform -translate-y-1/2"></div>
              )}
            </li>
            <li
              className="group relative"
              onClick={() => {
                setActiveTab('employees');
                setIsSidebarOpen(false);
              }}
            >
              <div className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <FaUser className="text-xl" />
              </div>
              <span className="absolute left-full ml-2 w-0 overflow-hidden group-hover:w-32 bg-blue-700 text-white px-2 py-1 rounded-r transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                Employees
              </span>
              {activeTab === 'employees' && (
                <div className="absolute left-0 w-1 h-8 bg-white top-1/2 transform -translate-y-1/2"></div>
              )}
            </li>
            <li
              className="group relative"
              onClick={() => {
                setActiveTab('productivity');
                setIsSidebarOpen(false);
              }}
            >
              <div className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <FaBars className="text-xl" />
              </div>
              <span className="absolute left-full ml-2 w-0 overflow-hidden group-hover:w-32 bg-blue-700 text-white px-2 py-1 rounded-r transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                Productivity
              </span>
              {activeTab === 'productivity' && (
                <div className="absolute left-0 w-1 h-8 bg-white top-1/2 transform -translate-y-1/2"></div>
              )}
            </li>

            <li
              className="group relative"
              onClick={() => {
                setActiveTab('departments');
                setIsSidebarOpen(false);
              }}
            >
              <div className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <FaPeopleCarry className="text-xl" />
              </div>
              <span className="absolute left-full ml-2 w-0 overflow-hidden group-hover:w-32 bg-blue-700 text-white px-2 py-1 rounded-r transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                Department
              </span>
              {activeTab === 'departments' && (
                <div className="absolute left-0 w-1 h-8 bg-white top-1/2 transform -translate-y-1/2"></div>
              )}
            </li>

            <li
              className="group relative"
              onClick={() => {
                setActiveTab('make-payments');
                setIsSidebarOpen(false);
              }}
            >
            
              <div className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <FaPaypal className="text-xl" />
              </div>
              <span className="absolute left-full ml-2 w-0 overflow-hidden group-hover:w-32 bg-blue-700 text-white px-2 py-1 rounded-r transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                Make-payments
              </span>
              {activeTab === 'make-payments' && (
                <div className="absolute left-0 w-1 h-8 bg-white top-1/2 transform -translate-y-1/2"></div>
              )}
            </li>
          
       
            <li
              className="group relative"
              onClick={() => {
                setActiveTab('salary');
                setIsSidebarOpen(false);
              }}
            >
             
              <div className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <FaMoneyCheckAlt className="text-xl" />
              </div>
              <span className="absolute left-full ml-2 w-0 overflow-hidden group-hover:w-32 bg-blue-700 text-white px-2 py-1 rounded-r transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                Salary
              </span>
              {activeTab === 'salary' && (
                <div className="absolute left-0 w-1 h-8 bg-white top-1/2 transform -translate-y-1/2"></div>
              )}
            </li>


            
            <li
              className="group relative"
              onClick={() => {
                setActiveTab('attendance');
                setIsSidebarOpen(false);
              }}
            >
             
              <div className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <FaPersonBooth className="text-xl" />
              </div>
              <span className="absolute left-full ml-2 w-0 overflow-hidden group-hover:w-32 bg-blue-700 text-white px-2 py-1 rounded-r transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                Attendance
              </span>
              {activeTab === 'attendance' && (
                <div className="absolute left-0 w-1 h-8 bg-white top-1/2 transform -translate-y-1/2"></div>
              )}
            </li>



            
            <li
              className="group relative"
              onClick={() => {
                setActiveTab('work');
                setIsSidebarOpen(false);
              }}
            >
             
              <div className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <FaMoneyCheckAlt className="text-xl" />
              </div>
              <span className="absolute left-full ml-2 w-0 overflow-hidden group-hover:w-32 bg-blue-700 text-white px-2 py-1 rounded-r transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                Work-Schedule
              </span>
              {activeTab === 'work' && (
                <div className="absolute left-0 w-1 h-8 bg-white top-1/2 transform -translate-y-1/2"></div>
              )}
            </li>



            <li
              className="group relative"
              onClick={() => {
                setActiveTab('settings');
                setIsSidebarOpen(false);
              }}
            >
              <div className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <FaCog className="text-xl" />
              </div>
              <span className="absolute left-full ml-2 w-0 overflow-hidden group-hover:w-32 bg-blue-700 text-white px-2 py-1 rounded-r transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                settings
              </span>
              {activeTab === 'settings' && (
                <div className="absolute left-0 w-1 h-8 bg-white top-1/2 transform -translate-y-1/2"></div>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-16">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-gray-800" onClick={toggleSidebar}>
              <FaBars className="text-2xl" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{data.name}</h2>
              <div className="text-gray-500 text-sm flex space-x-2">
                <span>{currentDateRange}</span> 
              </div>
            </div>
          </div>
      
        </header>

        {/* Main Content Area */}
        <main className="p-4">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;