import React from 'react';
import { motion } from "framer-motion";
import { FaFacebook, FaUser, FaFileAlt, FaSignOutAlt, FaUserCircle, FaRobot } from "react-icons/fa"; // Thêm FaUserCircle
import authService from '../LoginPage/LoginProcess/ValidateLogin';

const AdminSlideMenu = ({ isOpen, setIsOpen, navigate }) => {

    // Hàm xử lý đăng xuất
    const handleLogout = async () => {
        try {
            await authService.logout("admin");
            navigate("/admin/login");
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        }
    };

    const currentAdmin = authService.getAdminCurrentUser();
    // console.log("Thông tin admin hiện tại:", currentAdmin); // Bạn có thể giữ lại log này để debug

    return (
        <motion.div
            animate={{ width: isOpen ? "250px" : "60px" }}
            className="bg-gray-200 h-sreen p-4 overflow-hidden relative transition-all duration-300 flex flex-col justify-between
                      sm:w-[200px] md:w-[250px] fixed top-0 left-0 z-20 min-vh-100" // Đảm bảo h-screen để chiếm toàn bộ chiều cao
        >
            {/* Phần trên (Header và Menu) */}
            <div className='flex-grow'>
                {/* Header Sidebar */}
                <div className="flex justify-between items-center mb-4 relative">
                    {isOpen && (
                        <p className="text-lg md:text-xl font-bold flex items-center gap-2 cursor-pointer" onClick={()=>navigate("/admin")}>
                            <FaFacebook className="text-blue-600" /> Admin Page
                        </p>
                    )}
                    {/* Nút đóng/mở menu */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`p-1.5 text-sm bg-blue-500 text-white rounded absolute z-10 transition-all duration-300 focus:outline-none
                                    ${isOpen ? "right-[-15px] top-1/2 -translate-y-1/2" : "right-2 top-2"}`}
                    >
                        {isOpen ? "←" : "→"}
                    </button>
                </div>

                {/* Sidebar Menu */}
                {isOpen && (
                    <ul className="space-y-2 mt-8">
                        <li
                            className="p-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400 flex items-center gap-2 transition-colors"
                            onClick={() => navigate("/admin/user")}
                        >
                            <FaUser /> Quản lý người dùng
                        </li>
                        <li
                            className="p-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400 flex items-center gap-2 transition-colors"
                            onClick={() => navigate("/admin/posts")}
                        >
                            <FaFileAlt /> Quản lý bài viết
                        </li>
                        <li
                            className="p-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400 flex items-center gap-2 transition-colors"
                            onClick={() => navigate("/admin/chat-bot")}
                        >
                            <FaRobot /> Chat Bot
                        </li>
                        {/* Thêm các mục menu khác nếu cần */}
                    </ul>
                )}
                 {/* Hiển thị icon khi menu đóng */}
                 {!isOpen && (
                    <ul className="space-y-4 mt-10 flex flex-col items-center">
                        <li
                            className="p-2 text-gray-700 rounded cursor-pointer hover:bg-gray-400 transition-colors"
                            onClick={() => navigate("/admin/user")}
                            title="Quản lý người dùng"
                        >
                            <FaUser size={24} />
                        </li>
                        <li
                            className="p-2 text-gray-700 rounded cursor-pointer hover:bg-gray-400 transition-colors"
                            onClick={() => navigate("/admin/posts")}
                            title="Quản lý bài viết"
                        >
                            <FaFileAlt size={24} />
                        </li>
                        <li
                            className="p-2 text-gray-700 rounded cursor-pointer hover:bg-gray-400 transition-colors"
                            onClick={() => navigate("/admin/chat-bot")}
                            title="Chat Bot"
                        >
                            <FaRobot size={24} />
                        </li>
                        {/* Thêm các icon khác nếu cần */}
                    </ul>
                )}
            </div>

            {/* Phần dưới (Thông tin Admin và Đăng xuất) */}
            <div className="mt-auto">
                {isOpen ? (
                    // Khi menu mở
                    <>
                        {/* Hiển thị thông tin Admin */}
                        {currentAdmin && (
                            <div className="mb-4 p-2 bg-gray-300 rounded flex items-center gap-2">
                                <FaUserCircle className="text-gray-600" size={20} />
                                <span className="text-sm font-medium text-gray-700 truncate">
                                    {currentAdmin.username || 'Admin'} {/* Hiển thị username hoặc tên mặc định */}
                                </span>
                            </div>
                        )}
                        {/* Nút Đăng xuất */}
                        <button
                            className="w-full p-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 flex items-center justify-center gap-2 transition-colors"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt /> Đăng xuất
                        </button>
                    </>
                ) : (
                    // Khi menu đóng
                    <div className="flex flex-col items-center space-y-2">
                         {/* Icon Admin (có thể thêm tooltip nếu muốn) */}
                         {currentAdmin && (
                             <div title={currentAdmin.username || 'Admin'} className="p-2 text-gray-600">
                                 <FaUserCircle size={24} />
                             </div>
                         )}
                         {/* Icon Đăng xuất */}
                         <button
                             className="p-2 text-red-500 hover:text-red-700"
                             onClick={handleLogout}
                             title="Đăng xuất"
                         >
                             <FaSignOutAlt size={24} />
                         </button>
                     </div>
                 )}
            </div>
        </motion.div>
    );
};

export default AdminSlideMenu;