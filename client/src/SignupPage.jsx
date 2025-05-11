import { Link, } from "react-router-dom"
import { useState } from "react"





const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);

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

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !plan) {
      alert('Please fill all fields and select a plan');
    } else {
      alert(`Signup successful! Name: ${name}, Email: ${email}, Plan: ${plan}`);
    }
  };

  const openModal = (planKey) => {
    setSelectedPlanForModal(planKey);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="relative z-10 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">Sign Up</h2>
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {!name && <p className="text-red-500 text-sm mt-1">Name field cannot be empty</p>}
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {!email && <p className="text-red-500 text-sm mt-1">Email field cannot be empty</p>}
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {!password && <p className="text-red-500 text-sm mt-1">Password field cannot be empty</p>}
            </div>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">Select Plan:</p>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                {Object.keys(plans).map((p) => (
                  <label
                    key={p}
                    className="flex items-center space-x-2 relative"
                    onMouseEnter={() => setHoveredPlan(p)}
                    onMouseLeave={() => setHoveredPlan(null)}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p}
                      checked={plan === p}
                      onChange={() => setPlan(p)}
                      className="form-radio text-blue-600"
                    />
                    <span className="text-gray-700 cursor-pointer">{plans[p].name}</span>
                    {hoveredPlan === p && (
                      <div className="absolute z-10 top-8 left-0 mt-2 p-4 bg-gray-100 border rounded-lg shadow-md w-64 sm:w-72">
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
              {!plan && <p className="text-red-500 text-sm mt-1">Please select a plan</p>}
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Sign Up
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-blue-600 hover:underline">Already have an account? Login</Link>
          </div>
        </div>

        {/* Modal for Plan Details */}
        {showModal && selectedPlanForModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">{plans[selectedPlanForModal].name} Plan Details</h3>
              <p className="mb-2"><strong>Price:</strong> {plans[selectedPlanForModal].price}</p>
              <ul className="list-disc list-inside mb-4">
                {plans[selectedPlanForModal].detailedFeatures.map((feature, index) => (
                  <li key={index} className="text-gray-600">{feature}</li>
                ))}
              </ul>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




export default SignupPage