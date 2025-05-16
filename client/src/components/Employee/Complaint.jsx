import { useState, useEffect } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';
const Complaint = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [letter, setLetter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editableLetter, setEditableLetter] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedLetter, setEditedLetter] = useState(letter);





useEffect(() => {
  emailjs.init('YOUR_PUBLIC_KEY');
}, []);

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to continue');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data);
      } catch (err) {
        setError('Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Handle letter generation
  const handleGenerateLetter = async () => {
    if (!selectedEmployee || !complaintType) {
      setError('Please select an employee and complaint type');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/employees/${selectedEmployee}/complaint-letter`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { complaintType },
        }
      );
      setLetter(response.data.letter);
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.error || 'Failed to generate letter');
    } finally {
      setLoading(false);
    }
  };

  // Handle letter download
  const handleDownloadLetter = () => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaint_letter_${selectedEmployee}_${complaintType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle sending letter via email
  const handleSendEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/employees/${selectedEmployee}/send-letter`,
        { letter, complaintType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("letter has been successfully sent to the mail", {
        style:{background: "#4cf", color: "black"}
     })
    } catch (err) {
        console.log(err)
     toast.error("failed to send letter to the mail", {
        style:{background: "white", color: "black"}
     })
      setError('Failed to send letter');
    }
  };

  const handleSendWhatsApp = async() => {
    
    const employee = employees.find(emp => emp._id === selectedEmployee);
    if(!employee || !employee.phone){
      toast.error("employee phone number not available", {
        style:{background: "white", color: "black"}
      })
      return
    }
    const message = encodeURIComponent(editableLetter)
    const whatsappUrl = `https://wa.me/${employee.phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }


  const handleEditClick = () => {
    setIsEditing(true);
    setEditedLetter(letter);
  };

  const handleSaveEdit = () => {
  
    console.log('Saving edited letter:', editedLetter);
    setLetter(editedLetter)
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedLetter(letter);
  };

  const handleLetterChange = (e) => {
    setEditedLetter(e.target.value); 
  };


  return (
    <div className=" bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center"> Letter Generator</h1>

        {/* Employee Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Select Employee</label>
          <select
            aria-label="Select an employee"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            disabled={loading}
          >
            <option value="">Select an employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        {/* Complaint Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Complaint Type</label>
          <select
            aria-label="Select a complaint type"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a letter type</option>
            <option value="promotion">Promotion</option>
            <option value="pay-slip">pay-slip</option>
            <option value="query">query</option>
            <option value="employment">Employment</option>
            <option value="sacked">Sacked</option>
            <option value="dismissed">Dismissed</option>
            <option value="leave">Leave</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateLetter}
          disabled={loading}
          className={`w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Generating...' : 'Generate Letter'}
        </button>

        {/* Error Message */}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

        {/* Generated Letter */}
        {letter && (
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Generated Letter</h2>
        {isEditing ? (
          <div>
            <textarea
              className="w-full h-64 p-2 border border-gray-300 rounded-md text-sm"
              value={editedLetter}
              onChange={handleLetterChange}
            />
            <div className="mt-4 flex space-x-2">
              <button
                onClick={handleSaveEdit}
                className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <pre className="whitespace-pre-wrap text-sm">{editableLetter? editableLetter : letter}</pre>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={handleDownloadLetter}
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
              >
                Download Letter
              </button>
              <button
                onClick={handleSendEmail}
                className="bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 transition"
              >
                Send via Email
              </button>
              <button
                onClick={handleSendWhatsApp}
                className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition"
              >
                Send via WhatsApp
              </button>
              <button
                onClick={handleEditClick}
                className="bg-yellow-600 text-white p-2 rounded-md hover:bg-yellow-700 transition"
              >
                Edit Letter
              </button>
            </div>
          </>
        )}
      </div>
    )}
      </div>
    </div>
  );
};

export default Complaint;








































