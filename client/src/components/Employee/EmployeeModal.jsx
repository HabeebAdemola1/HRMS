/* eslint-disable react/prop-types */
import React from 'react';
import axios from 'axios';

const EmployeeModal = ({ show, onClose, formData, setFormData, isEdit, selectedEmployee, onSubmit }) => {
  if (!show) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadToCloudinary = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "essential");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dc0poqt9l"}/image/upload`,
        uploadFormData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      alert("Failed to upload image to Cloudinary. Please try again.");
      throw new Error("Failed to upload image to Cloudinary");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData({ ...formData, picture: imageUrl });
    } catch (error) {
      // Error is already handled in uploadToCloudinary with alert
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal-enter modal-enter-active bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isEdit ? 'Edit Employee' : selectedEmployee && !isEdit ? 'Employee Details' : 'Add Employee'}
        </h2>
        {selectedEmployee && !isEdit ? (
          <div className="space-y-4">
            <img
              src={selectedEmployee.picture || 'https://via.placeholder.com/150'}
              alt={selectedEmployee.name}
              className="w-24 h-24 rounded-full mx-auto object-cover"
            />
            <p><strong>Name:</strong> {selectedEmployee.name}</p>
            <p><strong>Phone:</strong> {selectedEmployee.phone}</p>
            <p><strong>Job Role:</strong> {selectedEmployee.jobRole}</p>
            <p><strong>Email:</strong> {selectedEmployee.email}</p>
            <p><strong>Qualification:</strong> {selectedEmployee.qualification}</p>
            <p><strong>Designation:</strong> {selectedEmployee.designation}</p>
            <p><strong>Department:</strong> {selectedEmployee.department}</p>
            <p><strong>Job Type:</strong> {selectedEmployee.jobType}</p>
            <p><strong>Salary:</strong> {selectedEmployee.salary}</p>
            <p><strong>Account No:</strong> {selectedEmployee.AcctNo}</p>
            <p><strong>Bank:</strong> {selectedEmployee.Bank}</p>
            <p><strong>Account Name:</strong> {selectedEmployee.AcctName}</p>
            <p><strong>Address:</strong> {selectedEmployee.address}</p>
            <p><strong>Gender:</strong> {selectedEmployee.gender}</p>
            <p><strong>Complaints:</strong> {selectedEmployee.complaints || 'None'}</p>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded w-full mt-4 transition duration-300"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {!formData.name && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Please write employee name</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {!formData.phone && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Phone number is required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Role</label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {!formData.jobRole && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Job role is required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {!formData.email && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Employee email is required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {!formData.qualification && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Employee qualification is required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {!formData.designation && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Employee designation is required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {!formData.department && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Employee department is required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Job Type</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                </select>
                {!formData.jobType && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Employee job type is required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {!formData.salary && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Employee salary is required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  name="AcctNo"
                  value={formData.AcctNo}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank</label>
                <input
                  type="text"
                  name="Bank"
                  value={formData.Bank}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  name="AcctName"
                  value={formData.AcctName}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                      {!formData.address && <p className="text-red-500 text-sm mt-1 animate-fadeIn">address is required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {!formData.gender && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Employee gender is required</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Complaints</label>
                <select
            aria-label="Select a complaint type"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formData.complaints}
            onChange={handleInputChange}
         
          >
            <option value="">Select a complaint type</option>
           <option value="none">none</option>
            <option value="sacked">Sacked</option>
            <option value="dismissed">Dismissed</option>
            <option value="leave">Leave</option>
            <option value="suspended">Suspended</option>
          </select>
        

              
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {formData.picture && (
                  <img
                    src={formData.picture}
                    alt="Preview"
                    className="mt-2 w-24 h-24 rounded-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
              >
                {isEdit ? 'Update' : 'Add'} Employee
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeModal;