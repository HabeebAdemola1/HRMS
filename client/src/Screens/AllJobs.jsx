import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Modal from 'react-modal';

// Set the app element for accessibility (required by react-modal)
Modal.setAppElement('#root');

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    YOE: '',
    course: '',
    qualification: '',
    email: '',
    phone: '',
    address: '',
    grade: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
      
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/job/getall`);
        setJobs(response.data);
      } catch (error) {
        console.log(error);
        setError(error.message || 'An error occurred while fetching jobs');
        toast.error(error.message || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenForm = (jobId) => {
    setSelectedJobId(jobId);
    setSelectedForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
    

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/job/applyjob/${selectedJobId}`,
        formData
      );
      toast.success('Job application submitted successfully!');
      setSelectedForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        YOE: '',
        course: '',
        qualification: '',
        email: '',
        phone: '',
        address: '',
        grade: '',
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-red-500 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Available Jobs</h1>
      {jobs.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No jobs available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{job.jobTitle}</h2>
              <p className="text-gray-600 mb-1"><strong>Company:</strong> {job.companyName || 'N/A'}</p>
              <p className="text-gray-600 mb-1"><strong>Employer:</strong> {job.employerId?.name || 'N/A'}</p>
              <p className="text-gray-600 mb-1"><strong>Type:</strong> {job.jobType || 'N/A'}</p>
              <p className="text-gray-600 mb-1"><strong>Location:</strong> {job.location || 'N/A'}</p>
              <p className="text-gray-600 mb-1"><strong>Salary:</strong> ${job.salary || 'N/A'}</p>
              <p className="text-gray-600 mb-1"><strong>Experience:</strong> {job.experience || 'N/A'}</p>
              <p className="text-gray-600 mb-1"><strong>Vacancies:</strong> {job.vacancies || 'N/A'}</p>
              <p className="text-gray-600 mb-1"><strong>Requirements:</strong> {job.requirements || 'N/A'}</p>
           
              <p className="text-gray-600 mb-1"><strong>Duties:</strong> {job.duties || 'N/A'}</p>
           
           
              <button
                onClick={() => handleOpenForm(job._id)}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Apply (Job: {job.jobTitle})
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={selectedForm}
        onRequestClose={() => setSelectedForm(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            height:'70%',
            maxWidth: '500px',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Apply for Job</h2>
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Years of Experience *</label>
            <input
              type="number"
              name="YOE"
              value={formData.YOE}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Course</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Qualification *</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Grade</label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setSelectedForm(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AllJobs;