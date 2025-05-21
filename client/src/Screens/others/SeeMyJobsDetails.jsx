import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SeeMyJobsDetails = () => {
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  // New state for modals and shortlist
  const [viewModal, setViewModal] = useState(false);
  const [shortlistModal, setShortlistModal] = useState(false);
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [shortlistMessage, setShortlistMessage] = useState('');
  const [shortlistLoading, setShortlistLoading] = useState(false);

  // Fetch jobs and job seekers
  useEffect(() => {
    const fetchJobsByEmployer = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token is missing');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/job/getJobByemployer`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMyJobs(response.data);
        toast.success('Check your posted jobs');
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error(error?.response?.data?.message || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    const fetchJobSeekers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token is missing');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/job/candidateapplyforJob`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setJobSeekers(response.data.jobSeekers || []);
        toast.success('Check job seekers that applied for your jobs');
      } catch (error) {
        console.error('Error fetching job seekers:', error);
        toast.error(error?.response?.data?.message || 'Failed to fetch job seekers');
      } finally {
        setLoading(false);
      }
    };

    fetchJobsByEmployer();
    fetchJobSeekers();
  }, []);

  // Calculate statistics for charts
  const totalJobsPosted = myJobs.length;
  const totalApplicants = jobSeekers.length;
  const matchingQualifications = jobSeekers.filter((seeker) => {
    const job = myJobs.find((job) => job._id === seeker.jobId);
    return job && seeker.YOE === job.experience || seeker?.qualification === job?.qualification;
  }).length;

  // Chart data for jobs posted
  const jobsChartData = {
    labels: ['Jobs Posted'],
    datasets: [
      {
        label: 'Number of Jobs',
        data: [totalJobsPosted],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for applicants
  const applicantsChartData = {
    labels: ['Job Applicants'],
    datasets: [
      {
        label: 'Number of Applicants',
        data: [totalApplicants],
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for matching qualifications
  const matchingChartData = {
    labels: ['Matching Qualifications'],
    datasets: [
      {
        label: 'Applicants Matching Job Qualifications',
        data: [matchingQualifications],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: (ctx) => ctx.chart.data.datasets[0].label },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  // Handle View button click
  const handleViewClick = (seeker) => {
    setSelectedSeeker(seeker);
    setViewModal(true);
  };

  // Handle Shortlist button click
  const handleShortlistClick = (seeker) => {
    setSelectedSeeker(seeker);
    setShortlistMessage(
      `Dear ${seeker.firstName} ${seeker.lastName},\n\nCongratulations! You have been shortlisted for an interview for the position of ${
        seeker.jobId.jobTitle || 'N/A'
      }. Please prepare for the next steps, and we will contact you soon with further details.\n\nBest regards,${seeker.employerId?.name}`
    );
    setShortlistModal(true);
  };

  // Handle Shortlist submission
  const handleShortlistSubmit = async () => {
    if (!selectedSeeker) return;

    try {
      setShortlistLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token is missing');
        return;
      }
      console.log ('job id', selectedSeeker?.jobId._id,)
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/job/shortlist`,
        {
          jobSeekerId: selectedSeeker._id,
          jobId: selectedSeeker?.jobId._id,
          email: selectedSeeker.email,
          message: shortlistMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
     

      // Update jobSeekers state to mark as shortlisted
      setJobSeekers((prev) =>
        prev.map((seeker) =>
          seeker._id === selectedSeeker._id ? { ...seeker, shortlisted: true } : seeker
        )
      );
      setShortlistModal(false);
      setSelectedSeeker(null);
      setShortlistMessage('');
      toast.success('Job seeker shortlisted and email sent successfully!');
    } catch (error) {
      console.error('Error shortlisting job seeker:', error);
      toast.error(error?.response?.data?.message || 'Failed to shortlist job seeker');
    } finally {
      setShortlistLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && <p className="text-center text-blue-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Jobs Posted</h2>
          <div className="h-64">
            <Bar data={jobsChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Job Applicants</h2>
          <div className="h-64">
            <Bar data={applicantsChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Matching Qualifications</h2>
          <div className="h-64">
            <Bar data={matchingChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Posted Jobs Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Posted Jobs</h2>
        {myJobs.length === 0 ? (
          <p className="text-gray-500">No jobs posted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Years of experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No of vacancies</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myJobs.map((job) => (
                  <tr key={job._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.jobTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.requirements}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{job.jobType || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{job.salary || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{job.duties || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{job.experience || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{job.vacancies || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Seekers Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Job Seekers</h2>
        {jobSeekers.length === 0 ? (
          <p className="text-gray-500">No job seekers have applied yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Applied For</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Years of Exp</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">course studied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">phone No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobSeekers.map((seeker) => {
                  const job = myJobs.find((job) => job._id === seeker.jobId);
                  const matchesQualification = job && seeker.qualification === job.qualification;
                  return (
                    <tr key={seeker._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${seeker.firstName} ${seeker.lastName}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seeker.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seeker.qualification}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900 font-bold">{seeker.jobId?.jobTitle || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seeker.YOE}</td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seeker.course}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seeker.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seeker.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seeker.grade}</td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            matchesQualification ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {matchesQualification ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="space-x-3">
                          <button
                            onClick={() => handleViewClick(seeker)}
                            className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleShortlistClick(seeker)}
                            className={`p-2 rounded-md text-white ${
                              seeker.shortlisted
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-400 hover:bg-green-500'
                            }`}
                            disabled={seeker.shortlisted}
                          >
                            {seeker.shortlisted ? 'Shortlisted' : 'Shortlist'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModal && selectedSeeker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Job Seeker Details</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedSeeker.firstName} {selectedSeeker.lastName}</p>
              <p><strong>Email:</strong> {selectedSeeker.email}</p>
              <p><strong>Qualification:</strong> {selectedSeeker.qualification}</p>
              <p><strong>Job Applied For:</strong>{selectedSeeker.jobId?.jobTitle}</p>
              <p><strong>Salary for Job Applied For:</strong>{selectedSeeker.jobId?.salary}</p>
              <p><strong>Requirments for Job Applied For:</strong>{selectedSeeker.jobId?.requirements}</p>
              <p><strong>Years of Experience:</strong> {selectedSeeker.YOE}</p>
              <p><strong>Course Studied:</strong> {selectedSeeker.course || 'N/A'}</p>
              <p><strong>Phone Number:</strong> {selectedSeeker.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedSeeker.address || 'N/A'}</p>
              <p><strong>Grade:</strong> {selectedSeeker.grade || 'N/A'}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setViewModal(false);
                  setSelectedSeeker(null);
                }}
                className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortlist Modal */}
      {shortlistModal && selectedSeeker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Shortlist Job Seeker</h2>
            <p className="mb-4 text-gray-600">
              Compose a message to shortlist {selectedSeeker.firstName} {selectedSeeker.lastName} for{' '}
              {selectedSeeker.jobId?.jobTitle}
            </p>
            <textarea
              className="w-full h-40 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              value={shortlistMessage}
              onChange={(e) => setShortlistMessage(e.target.value)}
              placeholder="Enter shortlist message..."
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShortlistModal(false);
                  setSelectedSeeker(null);
                  setShortlistMessage('');
                }}
                className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500"
                disabled={shortlistLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleShortlistSubmit}
                className="bg-green-400 text-white p-2 rounded-md hover:bg-green-500 flex items-center"
                disabled={shortlistLoading}
              >
                {shortlistLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeeMyJobsDetails;