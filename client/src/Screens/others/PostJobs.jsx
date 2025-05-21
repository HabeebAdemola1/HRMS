import axios from 'axios'
import { useEffect,useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
const PostJobs = () => {
      const [loading, setLoading] = useState(false);
      const [myJobs, setMyJobs] = useState([])
      const [error, setError] = useState("");
      const [formData, setFormData] = useState({
      companyName: "",
      companyAbout: "",
      jobTitle: "",
      jobType: "",
      location: "",
      salary: "",
      requirements: "",
      duties: "",
      vacancies: "",
      experience: "",
    });
    const handleInputChange = (e) => {
      const { name, value } = e.target; 
      setFormData((prevFormData) => ({
        ...prevFormData, 
        [name]: value, 
      }));
    };

    
    const handlePostJobSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
      
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email")
        const user = email.name
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await axios.post(
         `${import.meta.env.VITE_BACKEND_URL}/api/job/postjob`,
          {...formData,},
          config
        );
       console.log("the company name", user)

        setLoading(false);
        toast.success(response.data.message || "Job posted successfully!");
    
        setFormData({
          companyName: user,
          companyAbout: "",
          jobTitle: "",
          jobType: "",
          location: "",
          salary: "",
          requirements: "",
          duties: "",
          vacancies: "",
          experience: "",
        });
      } catch (error) {
        setLoading(false);
        toast.error(error.response?.data?.message || "Something went wrong!");
        setError(error.response?.data?.message || "something went wrong")
      }
    };

       useEffect(() => {
      const fetchJobsByEmployer = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("No token found");
            toast.error("Authentication token is missing");
            return;
          }
    
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/job/getJobByemployer`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          console.log("Fetched jobs:", response.data);
          setMyJobs(response.data); 
          toast.success("Check your posted jobs");
        } catch (error) {
          console.error("Error fetching jobs:", error);
          toast.error(error?.response?.data?.message || "Failed to fetch jobs");
        }
      };
    
      fetchJobsByEmployer();
    }, []);


  return (
    <div>
             <form onSubmit={handlePostJobSubmit}>
            {error &&  <p className="text-red-500">{error}</p>}
        {/* <div style={{ marginBottom: "10px" }}>
          <label>Company Name:</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            required
           className="w-full p-2 mt-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div> */}
        <div style={{ marginBottom: "10px" }}>
          <label>About the Company:</label>
          <textarea
            name="companyAbout"
            value={formData.companyAbout}
            onChange={handleInputChange}
            required
         className="w-full p-2 mt-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          ></textarea>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Job Title:</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            required
          className="w-full p-2 mt-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Job Type:</label>
          <input
            type="text"
            name="jobType"
            value={formData.jobType}
            onChange={handleInputChange}
            required
         className="w-full p-2 mt-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
           className="w-full p-2 mt-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Salary:</label>
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleInputChange}
            required
           className="w-full p-2 mt-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Requirements:</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleInputChange}
            required
          className="w-full p-2 mt-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          ></textarea>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Description:</label>
          <textarea
            name="duties"
            value={formData.duties}
            onChange={handleInputChange}
            required
         className="w-full p-2 mt-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          ></textarea>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Number of Vacancies:</label>
          <input
            type="number"
            name="vacancies"
            value={formData.vacancies}
            onChange={handleInputChange}
            required
         className="w-full p-2 mt-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Experience (in years):</label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            required
        className="w-full p-2 mt-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button type="submit" disabled={loading}    className={`w-full py-2 px-4 rounded ${
            loading
              ? "bg-blue-800 text-blue-100"
              : "bg-blue-400 text-white hover:bg-blue-600"
          }`}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
      
    </div>
  )
}

export default PostJobs
