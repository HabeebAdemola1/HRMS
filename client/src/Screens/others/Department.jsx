import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const Department = () => {
    const [employee, setEmployee] = useState([]);
    const [jobRoles, setJobRoles] = useState([]);
    const [groupedByDepartment, setGroupedByDepartment] = useState({});
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    //get my staff
    useEffect(() => {
      const handleGetMystaffs = async () => {
        setError("");
  
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/employees`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          setEmployee(response.data);
          console.log(response.data);
          toast.success("successfully fetched");
  
          const uniqueJobRoles = [
            ...new Set(response.data.map((emp) => emp.jobRole)),
          ];
          setJobRoles(uniqueJobRoles);
          const unqiueDepartments = [
            ...new Set(response.data.map((dep) => dep.department)),
          ];
          setDepartments(unqiueDepartments);
  
          const grouped = response.data.reduce((acc, employee) => {
            const { department } = employee;
            if (!acc[department]) {
              acc[department] = [];
            }
            acc[department].push(employee);
            return acc;
          }, {});
          setGroupedByDepartment(grouped);
        } catch (error) {
          console.log(error);
          setError(error.response?.data?.message);
          toast.error(" couldnt get your staffs due to an error occured");
        }
      };
      handleGetMystaffs();
    }, []);

    // Function to open modal with selected employee details
    const handleViewMore = (emp) => {
      setSelectedEmployee(emp);
      setShowModal(true);
    };

    return (
      <>
        <div className="text-black">
          <h3>Departments ({departments.length})</h3>
          <ul className="flex space-x-4 text-green-600">
            {departments.map((department, index) => (
              <li key={index}>{department}</li>
            ))}
          </ul>
  
          <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                All Departments
              </h1>
              <p className="text-gray-500">All Departments Information</p>
            </header>
  
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(groupedByDepartment).map(([dept, members]) => (
                <div
                  key={dept}
                  className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                >
                  <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    {dept} ({members.length} Members)
                  </h2>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {dept.name}
                    </h2>
                    <button className="text-blue-500 hover:underline">
                      View All
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {dept.members} Members
                  </p>
                  <ul>
                    {Array.isArray(members) &&
                      members?.map((emp, index) => (
                        <li
                          key={emp.id}
                          className="flex items-center justify-between space-x-3 py-2 border-b last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100">
                              <img
                                src={
                                  emp.picture ||
                                  `https://i.pravatar.cc/30?img=${index}`
                                }
                                alt="Employee"
                                className="w-8 h-8 rounded-full"
                              />
                            </div>
                            <div>
                              <p className="text-gray-800 font-medium text-sm">
                                {emp.name} {emp.lastname}
                              </p>
                              <p className="text-gray-500 text-xs">{emp.jobRole}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewMore(emp)}
                            className="text-blue-500 hover:underline text-sm"
                          >
                            View More
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal for Employee Details */}
        {showModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Employee Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      selectedEmployee.picture ||
                      `https://i.pravatar.cc/30?img=${selectedEmployee.id}`
                    }
                    alt="Employee"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedEmployee.name} 
                    </p>
                    <p className="text-gray-500 text-sm">{selectedEmployee.jobRole}</p>
                  </div>
                </div>
                <p><strong>Department:</strong> {selectedEmployee.department}</p>
                <p><strong>Email:</strong> {selectedEmployee.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedEmployee.phone || 'N/A'}</p>
                <p><strong>Qualification:</strong> {selectedEmployee.qualification || 'N/A'}</p>
                <p><strong>Designation:</strong> {selectedEmployee.designation || 'N/A'}</p>
                <p><strong>Job Type:</strong> {selectedEmployee.jobType || 'N/A'}</p>
                <p><strong>Salary:</strong> {selectedEmployee.salary || 'N/A'}</p>
                <p><strong>Account Number:</strong> {selectedEmployee.AcctNo || 'N/A'}</p>
                <p><strong>Bank:</strong> {selectedEmployee.Bank || 'N/A'}</p>
                <p><strong>Account Name:</strong> {selectedEmployee.AcctName || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedEmployee.address || 'N/A'}</p>
                <p><strong>Gender:</strong> {selectedEmployee.gender || 'N/A'}</p>
                <p><strong>Complaints:</strong> {selectedEmployee.complaints || 'None'}</p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
};

export default Department;