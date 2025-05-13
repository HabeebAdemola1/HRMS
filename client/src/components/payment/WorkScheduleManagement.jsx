import { useEffect, useState } from "react";
import axios from "axios";
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:1000'}/api`;


const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const WorkScheduleManagement = () => {
    const [schedule, setSchedule] = useState({
      companyId: '',
      standardStartTime: '09:00',
      workDaysPerWeek: { permanent: 5, hybrid: 3, remote: 0 },
    });
    const [error, setError] = useState('');

    useEffect(() => {
      fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/work-schedule`, getAuthHeader());
        setSchedule(res.data);
      } catch (error) {
        setError('Failed to fetch work schedule');
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      if (name.includes('.')) {
        const [field, subField] = name.split('.');
        setSchedule({
          ...schedule,
          [field]: { ...schedule[field], [subField]: parseInt(value) || 0 },
        });
      } else {
        setSchedule({ ...schedule, [name]: value });
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API_BASE_URL}/work-schedule`, schedule, getAuthHeader());
        fetchSchedule();
        setError('');
      } catch (error) {
        setError('Failed to save work schedule');
      }
    };

    return (
      <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Work Schedule Management</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Update Work Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="companyId"
              value={schedule.companyId}
              onChange={handleInputChange}
              placeholder="Company ID"
              className="w-full p-2 border rounded-md"
              required
            />
            <input
              type="time"
              name="standardStartTime"
              value={schedule.standardStartTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
            <input
              type="number"
              name="workDaysPerWeek.permanent"
              value={schedule.workDaysPerWeek.permanent}
              onChange={handleInputChange}
              placeholder="Permanent Work Days/Week"
              className="w-full p-2 border rounded-md"
              required
            />
            <input
              type="number"
              name="workDaysPerWeek.hybrid"
              value={schedule.workDaysPerWeek.hybrid}
              onChange={handleInputChange}
              placeholder="Hybrid Work Days/Week"
              className="w-full p-2 border rounded-md"
              required
            />
            <input
              type="number"
              name="workDaysPerWeek.remote"
              value={schedule.workDaysPerWeek.remote}
              onChange={handleInputChange}
              placeholder="Remote Work Days/Week"
              className="w-full p-2 border rounded-md"
              required
            />
            <button
              onClick={handleSubmit}
              className="w-full sm:col-span-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    );
  };


  export default WorkScheduleManagement