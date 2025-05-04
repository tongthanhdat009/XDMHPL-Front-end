import React, { useState } from "react";
import axios from "axios";
import { FaArrowLeft } from 'react-icons/fa'; // Import icon for back button

// Optional: Add a prop for navigation back if needed
const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); // Separate state for errors
  const [loading, setLoading] = useState(false); // State for loading indicator

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setError("");   // Clear previous errors
    setLoading(true); // Set loading state

    try {
      const response = await axios.post("http://localhost:8080/auth/forgot-password", { email });
      setMessage(response.data.message || "Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn."); // Use backend message or a default success message
    } catch (err) {
      // Try to get a specific error message from backend response
      const backendError = err.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.";
      setError(backendError);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        {/* Optional Back Button */}
        {onBack && (
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800 mb-4 flex items-center">
            <FaArrowLeft className="mr-2" /> Quay lại
          </button>
        )}

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Tìm tài khoản của bạn</h2>
        <hr className="mb-6" /> {/* Divider line */}
        <p className="text-gray-600 mb-6 text-center">
          Vui lòng nhập email để tìm kiếm tài khoản của bạn.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading} // Disable input while loading
            />
          </div>

          {/* Display Success or Error Messages */}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex justify-end items-center pt-2"> {/* Align button to the right */}
            {/* Optional Cancel Button */}
            {/* <button type="button" onClick={onBack || (() => {})} className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400" disabled={loading}>
              Hủy
            </button> */}
            <button
              type="submit"
              className={`px-6 py-2 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading
                  ? 'bg-blue-300 cursor-not-allowed' // Style for loading state
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' // Normal style
              }`}
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Đang gửi...' : 'Tìm kiếm'} {/* Change button text when loading */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;