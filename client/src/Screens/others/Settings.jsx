
import axios from 'axios'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'



const Settings = () => {
  const {loading, setLoading} = useState(false)
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })


  const handleToggleDashboardAccess= async() => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/employees/toggle-dashboard`, getAuthHeader())
      toast.success(response.data.message, {
        style: { background: '#4cf', color: 'black' },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle dashboard access', {
        style: { background: 'white', color: 'black' },
      });
    }
  }
  return (
    <div>
        <div className="mb-8">
        <button
          onClick={handleToggleDashboardAccess}
          type='radio'
          disabled={loading}
          className={` max-w-xs bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Enable Dashboard Access'}
        </button>
      </div>
      
    </div>
  )
}

export default Settings
















