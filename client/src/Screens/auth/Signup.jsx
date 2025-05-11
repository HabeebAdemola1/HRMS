import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FaTable, FaChair, FaClock, FaCalendarAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'sonner';
import axios from 'axios';
import { Toaster } from 'sonner';
const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();

  const plans = {
    regular: {
      name: 'Regular',
      price: '$10/month',
      features: ['Basic Access', 'Limited Reports', 'Email Support'],
      detailedFeatures: ['Basic Access to Dashboard', 'Limited Report Generation (5/month)', 'Email Support (Business Hours)'],
    },
    premium: {
      name: 'Premium',
      price: '$20/month',
      features: ['Full Access', 'Advanced Reports', 'Priority Support'],
      detailedFeatures: ['Full Access to Dashboard', 'Advanced Report Generation (20/month)', 'Priority Email and Chat Support'],
    },
    platinum: {
      name: 'Platinum',
      price: '$30/month',
      features: ['Full Access', 'Premium Reports', '24/7 Support', 'Custom Features'],
      detailedFeatures: ['Full Access to Dashboard', 'Premium Report Generation (Unlimited)', '24/7 Phone, Email, and Chat Support', 'Custom Feature Development'],
    },
  };

  const handleSignup = async (e) => {
    setLoading(true);
    setError(null);
    e.preventDefault();
    try {
      console.log('sending registration', { name, email, password, plan, role: 'admin' });
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
        name,
        email,
        password,
        plan,
        role: 'admin',
      });
     
      if (response.data) {
        localStorage.setItem("token", response.data.token);
        navigate(`/verifyemail?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`);
        toast.success("Registration successful, redirecting to verify email page", {
          style: { background: "#0C6A0CFF", color: "white" },
        });
      }
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: { background: "#F44336", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (planKey) => {
    setSelectedPlanForModal(planKey);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Signup Card */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-700 text-center mb-6 animate-fadeIn">Sign Up</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 transform hover:scale-105"
              />
          
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 transform hover:scale-105"
              />
           
            </div>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">Select Plan:</p>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                {Object.keys(plans).map((p) => (
                  <label
                    key={p}
                    className="flex items-center space-x-2 relative group"
                    onMouseEnter={() => setHoveredPlan(p)}
                    onMouseLeave={() => setHoveredPlan(null)}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p}
                      checked={plan === p}
                      onChange={() => setPlan(p)}
                      className="form-radio text-blue-600 transition-all duration-300 transform group-hover:scale-110"
                    />
                    <span className="text-gray-700 cursor-pointer transition-colors duration-300 group-hover:text-blue-600">
                      {plans[p].name}
                    </span>
                    {hoveredPlan === p && (
                      <div className="absolute z-10 top-8 left-0 mt-2 p-4 bg-gray-100 border rounded-lg shadow-md w-64 sm:w-72 animate-slideDown">
                        <h3 className="text-lg font-semibold">{plans[p].name} - {plans[p].price}</h3>
                        <ul className="list-disc list-inside mt-2">
                          {plans[p].features.map((feature, index) => (
                            <li key={index} className="text-gray-600">{feature}</li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => openModal(p)}
                          className="mt-2 text-blue-600 hover:underline"
                        >
                          View More
                        </button>
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {!plan && <p className="text-red-500 text-sm mt-1 animate-fadeIn">Please select a plan</p>}
            </div>
            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 transform hover:scale-105"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
           
            </div>
         
            {error && <p className="text-red-500 text-sm mt-1 animate-fadeIn">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:underline transition-all duration-300 hover:text-blue-800"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>

        {/* Animated Background Image */}
        <div className="w-full md:w-1/2 relative bg-gradient-to-br from-blue-600 to-purple-800 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-10"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-20 rotate-45"></div>
          <div className="relative z-20 flex items-center justify-center w-full h-full">
            <svg
              className="w-3/4 h-3/4 text-white animate-pulse hover:animate-bounce"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Desk */}
              <rect x="100" y="300" width="200" height="20" fill="rgba(255, 255, 255, 0.3)" />

              {/* Laptop Base */}
              <rect x="150" y="250" width="100" height="50" fill="rgba(255, 255, 255, 0.5)" rx="5" />

              {/* Laptop Screen */}
              <rect
                x="150"
                y="200"
                width="100"
                height="50"
                fill="rgba(255, 255, 255, 0.7)"
                rx="5"
                className="animate-pulse"
              />

              {/* Person's Body */}
              <rect x="180" y="150" width="40" height="80" fill="rgba(255, 255, 255, 0.4)" rx="5" />

              {/* Person's Head */}
              <circle
                cx="200"
                cy="130"
                r="20"
                fill="rgba(255, 255, 255, 0.6)"
                className="animate-float"
              />

              {/* Arms */}
              <rect x="160" y="170" width="20" height="50" fill="rgba(255, 255, 255, 0.4)" rx="3" transform="rotate(-15 160 170)" />
              <rect x="220" y="170" width="20" height="50" fill="rgba(255, 255, 255, 0.4)" rx="3" transform="rotate(15 220 170)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Modal for Plan Details */}
      {showModal && selectedPlanForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4">{plans[selectedPlanForModal].name} Plan Details</h3>
            <p className="mb-2"><strong>Price:</strong> {plans[selectedPlanForModal].price}</p>
            <ul className="list-disc list-inside mb-4">
              {plans[selectedPlanForModal].detailedFeatures.map((feature, index) => (
                <li key={index} className="text-gray-600">{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
          .animate-slideDown { animation: slideDown 0.3s ease-out; }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-spin-slow { animation: spin-slow 6s linear infinite; }
          .animate-bounce { animation: bounce 2s infinite; }
          .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        `}
      </style>
    </div>
  );
};

export default Signup;