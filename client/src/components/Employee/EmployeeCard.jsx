import React from 'react';

const EmployeeCard = ({ employee, index, onView, onEdit, onDelete }) => {
  return (
    <div
      className="card-enter card-enter-active bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center mb-4">
        <img
          src={employee.picture || 'https://via.placeholder.com/150'}
          alt={employee.name}
          className="w-16 h-16 rounded-full mr-4 object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{employee.name}</h2>
          <p className="text-gray-600">{employee.jobRole}</p>
        </div>
      </div>
      <p className="text-gray-600 mb-2">Email: {employee.email}</p>
      <p className="text-gray-600 mb-4">Department: {employee.department}</p>
      <div className="flex justify-between">
        <button
          onClick={onView}
          className="text-blue-600 hover:text-blue-700 font-semibold transition duration-200"
        >
          View More
        </button>
        <div className="space-x-4">
          <button
            onClick={onEdit}
            className="text-green-600 hover:text-green-700 font-semibold transition duration-200"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 font-semibold transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;