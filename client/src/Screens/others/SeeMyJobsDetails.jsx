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
    return job && seeker.qualification === job.qualification;
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches Qualification</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job ? job.title : 'Unknown Job'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            matchesQualification ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {matchesQualification ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeeMyJobsDetails;