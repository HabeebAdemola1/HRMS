import { useState } from "react";
import { FaFacebookF, FaGoogle, FaTwitter, FaUserCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import Navbar from "../../components/Navbar";


const LoginStaff = () => {
  const [uniqueNumber, setUniqueNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting login with data:", { uniqueNumber});
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/employees/employee-login`,  {uniqueNumber }
      
      );

      if (response.data) {
        localStorage.setItem("token", response.data.token);
        console.log(response.data.token)
        localStorage.setItem("uniqueNumber", response.data.employee.uniqueNumber)
      
     
        const message = response.data?.message
       
    

        toast.success( message, {
          style: { background: "#4CAF50", color: "white", fontSize: "bold" },
        });
     
        navigate("/staffdashboard");
      }
    } catch (err) {
      console.log("Login Error:", {
        message: err.response?.data?.message || err.message || "An unknown error occurred",
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack,
      });
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: { background: "#F44336", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
   
      <div className="min-h-screen flex items-center justify-center bg-white px-4 relative overflow-hidden">
 
    

        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg relative z-10">
          <div className="flex flex-col items-center mb-6">
            <FaUserCheck size={64} className="text-Icons mb-2" />
            <h1 className="text-2xl font-bold text-gray-800">Login as a staff</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Unique Number
              </label>
              <input
                type="uniqueNumber"
                id="uniqueNumber"
                value={uniqueNumber}
                onChange={(e) => setUniqueNumber(e.target.value)}
                placeholder="Enter your unique number"
                className="w-full p-3 border border-e-ride-purple rounded-full focus:outline-none focus:ring-2 focus:ring-e-ride-purple"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-Blue text-Background font-semibold rounded-full hover:bg-Icons focus:outline-none focus:ring-2 focus:ring-e-ride-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "SIGN IN"}
            </button>
          </form>

    
       
        </div>
      </div>
    </>
  );
};

export default LoginStaff;




