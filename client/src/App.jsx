
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import { Toaster } from "sonner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Screens/auth/Login";
import AdminDashboard from "./Screens/Dashboards/AdminDashboard";
import Signup from "./Screens/auth/Signup";
import Navbar from "./components/Navbar";
import EmailVerify from "./Screens/auth/VerifyEmail";
import SuperAdminSignup from "./Screens/auth/SuperAdminSignup";
import SuperAdminDashboard from "./Screens/superAdmin/SuperAdminDashboard";
import LoginStaff from "./Screens/auth/LoginStaff";
import StaffDashboard from "./Screens/employee/StaffDashboard";
const App = () => {
  return (
    <div>
      <Router>
        <Toaster />
        <Navbar />
        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admindashboard" element={<AdminDashboard /> } />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verifyemail" element={<EmailVerify />} />
          <Route path="/superadminsingup" element={<SuperAdminSignup />} />
          <Route path="/superadmindashboard" element={<SuperAdminDashboard /> } />
          <Route path="/stafflogin" element={<LoginStaff />} />
          <Route path="/staffdashboard" element={<StaffDashboard />} />

         
        
        </Routes>
      </Router>
      
    </div>
  )
}

export default App
