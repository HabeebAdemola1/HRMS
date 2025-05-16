import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token")
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return ( 
    <nav className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold">HR management</Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* <Link
                to="/"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link> */}
              {isLoggedIn ? (
                <button
                onClick={handleLogout}
                className='block bg-white p-2 text-red-400 rounded-md'
                >
                  Log Out
                </button>
              ): (
                <>
                       <Link
                to="/stafflogin"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login as a staff
              </Link>
                     <Link
                to="/login"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
                </>
              )}
         
              {/* <Link
                to="/dashboard"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link> */}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-blue-700 focus:outline-none p-2 rounded-md"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={isOpen ? "block md:hidden" : "hidden md:hidden"}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isLoggedIn ? (
              <button
              onClick={handleLogout}
              className='block bg-white p-2 text-red-400 rounded-md'
              >
                Log Out
              </button>
          ):(
              <>
                
          <Link
            to="/login"
            className="hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Sign Up
          </Link>
              </>
          )}
       
        
        </div>
      </div>
    </nav>
  );
};

export default Navbar;