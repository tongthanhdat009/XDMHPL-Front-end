import React, { useState, useEffect } from 'react';
// Giả sử bạn có một service riêng để xác thực admin
// import adminAuthService from './path/to/adminAuthService'; // Không cần nếu dùng chung authService
import authService from '../../../components/LoginPage/LoginProcess/ValidateLogin'; // Import authService
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const [remember, setRemember] = useState(true); // Remember không được dùng trong authService.login
  const [error, setError] = useState(''); // State để hiển thị lỗi
  const navigate = useNavigate();
  
  useEffect(() => {
    const admin = authService.getAdminCurrentUser(); // Lấy thông tin admin
    if (admin) {
      console.log("Admin đã đăng nhập, điều hướng đến /admin");
      navigate('/admin/user', { replace: true }); // Nếu đã đăng nhập, chuyển đến trang admin
    }
  }, [navigate]); 
  
  // --- Kết thúc sửa ---
    // Hàm xử lý khi submit form
    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setError('');
      
      console.log('Thông tin đăng nhập Admin:', { username, password }); // Bỏ remember
      if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      setLoading(false);
      return;
    }

    try {
      // --- SỬ DỤNG authService.login VỚI role="admin" ---
      const role = "admin"; 
      const result = await authService.login(username, password, role);
      console.log("Kết quả đăng nhập Admin:", result);

      if (result.success) {
        navigate('/admin/user');
      } else {
        setError(result.error?.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (err) { 
      console.error("Lỗi đăng nhập quản trị:", err);
      setError('Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
             Đăng nhập vào tài khoản quản trị
           </h2>
        </div>

        {/* Card chứa form */}
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Input Tên đăng nhập */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Tên đăng nhập
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </div>

            {/* Input Mật khẩu */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>

            {/* Nút Đăng nhập */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {/* Icon loading SVG (tùy chọn) */}
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;